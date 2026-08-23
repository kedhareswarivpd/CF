import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.core.password import hash_password
from app.core.tokens import generate_token, hash_token
from app.crud.base import CRUDBase
from app.models.client import Client
from app.models.contract import Contract
from app.models.enums import ContractStatus, LeadStatus, NotificationType, ProposalStatus
from app.models.lead import Lead
from app.models.password_reset_token import PasswordResetToken
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.crm import ContractCreate, ContractOut, ContractSign
from app.services.email_service import send_password_reset_email, send_welcome_email
from app.services.notification_service import notify_roles
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

PASSWORD_RESET_TOKEN_TTL_HOURS = 1

router = APIRouter(prefix="/contracts", tags=["CRM — Contracts"], dependencies=[Depends(require_roles("sales", "admin", "project_manager", "marketing"))])

crud = CRUDBase(Contract)
lead_crud = CRUDBase(Lead)


@router.get("", response_model=dict)
async def list_contracts(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("status", "proposal_id") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ContractOut.model_validate(c) for c in items], message="Contracts fetched", meta=meta)


@router.post("", response_model=dict, status_code=201)
async def create_contract(payload: ContractCreate, response: Response, db: AsyncSession = Depends(get_db)):
    proposal = (await db.execute(select(Proposal).where(Proposal.id == payload.proposal_id))).scalar_one_or_none()
    if proposal is None:
        raise ApiError.not_found("Proposal not found")
    if proposal.status != ProposalStatus.accepted:
        raise ApiError.bad_request("A contract can only be generated from an accepted proposal")

    # Check if a contract for this proposal already exists — return it gracefully (idempotent)
    existing = (await db.execute(select(Contract).where(Contract.proposal_id == payload.proposal_id))).scalar_one_or_none()
    if existing:
        # The route decorator's `status_code=201` is only a default — a
        # returned dict doesn't override the real HTTP status, only
        # `response.status_code` does (found as a side effect of fixing the
        # identical bug in finance.py::record_payment this session; without
        # this the real response stayed 201 even though nothing was created).
        response.status_code = 200
        return success_response(
            data=ContractOut.model_validate(existing),
            message="Contract already exists for this proposal",
            status_code=200,
        )

    try:
        contract = await crud.create(db, payload.model_dump())
    except Exception as exc:
        logger.exception("Failed to create contract for proposal %s: %s", payload.proposal_id, exc)
        raise ApiError.bad_request("Could not draft contract. Please verify proposal details and try again.") from exc

    return success_response(data=ContractOut.model_validate(contract), message="Contract drafted", status_code=201)


async def _get_or_create_client_user(db: AsyncSession, lead: Lead) -> tuple[User | None, bool]:
    """Finds the User row for this lead's email, or creates one — a local
    account, hashed random unusable password (the person sets their own via
    the password-set email `_send_client_welcome` sends, never a plaintext
    password this backend generated).

    Returns `(user, created)` — `created` tells the caller whether this is a
    brand-new account (which needs a welcome/credentials email) or a reused
    existing one (which doesn't).
    """
    existing_user = (await db.execute(select(User).where(User.email == lead.email))).scalar_one_or_none()
    if existing_user is not None:
        return existing_user, False

    user = User(
        id=uuid.uuid4(),
        name=lead.contact_name,
        email=lead.email,
        password_hash=hash_password(secrets.token_urlsafe(32)),  # unusable placeholder; real one set via the reset link below
        phone=lead.phone,
        role="client",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user, True


async def _send_client_welcome(db: AsyncSession, user: User, lead: Lead) -> None:
    """Best-effort: issues a real, usable password-set link (the same
    mechanism as /auth/forgot-password) plus a separate welcome notification.
    Failures are logged, never raised — the account itself is already
    committed by the time this runs, so a delivery failure shouldn't undo it
    or fail the contract-signing request; an admin can always trigger another
    reset later even if both sends fail here."""
    try:
        token = generate_token()
        db.add(PasswordResetToken(
            user_id=user.id, token_hash=hash_token(token),
            expires_at=datetime.now(UTC) + timedelta(hours=PASSWORD_RESET_TOKEN_TTL_HOURS),
        ))
        await db.commit()
        reset_url = f"{settings.client_url.rstrip('/')}/reset-password?token={token}"
        await send_password_reset_email(lead.contact_name, lead.email, reset_url)
    except Exception as exc:  # noqa: BLE001 — account provisioning must not fail over email delivery
        logger.warning("Failed to send password-reset email to %s: %s", lead.email, exc)
    try:
        await send_welcome_email(lead.contact_name, lead.email)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to send welcome email to %s: %s", lead.email, exc)


async def _get_or_create_client_record(db: AsyncSession, user: User, lead: Lead) -> Client:
    """Finds the Client profile row for this user, or creates one — linked
    to the lead's owner's Employee record as account manager, if resolvable."""
    from app.models.employee import Employee

    # Map lead.owner_id (User.id) to Employee.id because Client.account_manager_id references employees.id
    account_mgr_employee = None
    if lead.owner_id:
        account_mgr_employee = (await db.execute(select(Employee).where(Employee.user_id == lead.owner_id))).scalar_one_or_none()

    client = (await db.execute(select(Client).where(Client.user_id == user.id))).scalar_one_or_none()
    if client is not None:
        return client

    client = Client(
        user_id=user.id,
        company_name=lead.company,
        account_manager_id=account_mgr_employee.id if account_mgr_employee else None,
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


async def _provision_client_account(db: AsyncSession, lead: Lead) -> Client | None:
    """Orchestrates client provisioning for a newly-won lead: find-or-create
    the local User account (sending the welcome/password-set email only
    when that account is actually new), then find-or-create the linked
    Client profile."""
    user, created = await _get_or_create_client_user(db, lead)
    if user is None:
        return None
    if created:
        await _send_client_welcome(db, user, lead)
    return await _get_or_create_client_record(db, user, lead)


@router.post("/{contract_id}/sign", response_model=dict)
async def sign_contract(contract_id: uuid.UUID, payload: ContractSign, db: AsyncSession = Depends(get_db)):
    contract = await crud.get(db, contract_id)
    if contract.status == ContractStatus.signed:
        return success_response(data=ContractOut.model_validate(contract), message="Contract is already signed")

    now = datetime.now(UTC)
    update_data = {}
    if payload.client_signed:
        update_data["signed_by_client_at"] = now
    if payload.company_signed:
        update_data["signed_by_company_at"] = now

    contract = await crud.update(db, contract_id, update_data)

    if contract.signed_by_client_at and contract.signed_by_company_at:
        contract = await crud.update(db, contract_id, {"status": ContractStatus.signed})

        proposal = (await db.execute(select(Proposal).where(Proposal.id == contract.proposal_id))).scalar_one_or_none()
        lead = (await db.execute(select(Lead).where(Lead.id == proposal.lead_id))).scalar_one_or_none() if proposal else None

        if lead is not None and lead.status != LeadStatus.converted:
            client = None
            if payload.provision_client_account:
                try:
                    client = await _provision_client_account(db, lead)
                except Exception as exc:  # noqa: BLE001 — contract stays signed even if account provisioning has an issue
                    logger.error(f"Client account provisioning failed for lead {lead.id}: {exc}")

            await lead_crud.update(db, lead.id, {
                "status": LeadStatus.converted,
                "converted_client_id": client.id if client else lead.converted_client_id,
            })

            await notify_roles(
                db, ["project_manager", "admin"], "New client ready for project kickoff",
                f"{lead.company or lead.contact_name} signed their contract — create the onboarding project.",
                NotificationType.success, f"/employee-portal?tab=projects&lead={lead.id}",
            )

    return success_response(data=ContractOut.model_validate(contract), message="Contract signature recorded")
