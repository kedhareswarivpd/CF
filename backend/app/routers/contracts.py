import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.client import Client
from app.models.contract import Contract
from app.models.enums import ContractStatus, LeadStatus, NotificationType, ProposalStatus
from app.models.lead import Lead
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.crm import ContractCreate, ContractOut, ContractSign
from app.services.email_service import send_welcome_email
from app.services.notification_service import notify_roles
from app.services.supabase_client import get_admin_client, get_anon_client
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/contracts", tags=["CRM — Contracts"], dependencies=[Depends(require_roles("sales", "admin"))])

crud = CRUDBase(Contract)
lead_crud = CRUDBase(Lead)


@router.get("", response_model=dict)
async def list_contracts(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("status", "proposal_id") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ContractOut.model_validate(c) for c in items], message="Contracts fetched", meta=meta)


@router.get("/{contract_id}", response_model=dict)
async def get_contract(contract_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    contract = await crud.get(db, contract_id)
    return success_response(data=ContractOut.model_validate(contract))


@router.post("", response_model=dict, status_code=201)
async def create_contract(payload: ContractCreate, db: AsyncSession = Depends(get_db)):
    proposal = (await db.execute(select(Proposal).where(Proposal.id == payload.proposal_id))).scalar_one_or_none()
    if proposal is None:
        raise ApiError.not_found("Proposal not found")
    if proposal.status != ProposalStatus.accepted:
        raise ApiError.bad_request("A contract can only be generated from an accepted proposal")

    contract = await crud.create(db, payload.model_dump())
    return success_response(data=ContractOut.model_validate(contract), message="Contract drafted", status_code=201)


async def _provision_client_account(db: AsyncSession, lead: Lead) -> Client:
    """Creates the Supabase auth user + local User/Client rows for a newly-won lead, or reuses an existing account with that email."""
    existing_user = (await db.execute(select(User).where(User.email == lead.email))).scalar_one_or_none()

    if existing_user is None:
        admin = get_admin_client()
        temp_password = secrets.token_urlsafe(18)
        try:
            auth_response = await run_in_threadpool(
                admin.auth.admin.create_user,
                {
                    "email": lead.email,
                    "password": temp_password,
                    "email_confirm": True,
                    "user_metadata": {"name": lead.contact_name, "role": "client"},
                },
            )
        except Exception as exc:  # noqa: BLE001
            raise ApiError.bad_request(f"Could not provision the client's Supabase account: {exc}") from exc

        existing_user = User(
            id=uuid.UUID(auth_response.user.id),
            name=lead.contact_name,
            email=lead.email,
            phone=lead.phone,
            role="client",
            is_active=True,
            is_email_verified=True,
        )
        db.add(existing_user)
        await db.commit()
        await db.refresh(existing_user)

        anon = get_anon_client()
        try:
            await run_in_threadpool(anon.auth.reset_password_for_email, lead.email, {})
        except Exception:  # noqa: BLE001 — account is already usable via admin reset if this fails
            pass
        try:
            await send_welcome_email(lead.contact_name, lead.email)
        except Exception:  # noqa: BLE001
            pass

    client = (await db.execute(select(Client).where(Client.user_id == existing_user.id))).scalar_one_or_none()
    if client is None:
        client = Client(
            user_id=existing_user.id,
            company_name=lead.company,
            account_manager_id=lead.owner_id,
        )
        db.add(client)
        await db.commit()
        await db.refresh(client)

    return client


@router.post("/{contract_id}/sign", response_model=dict)
async def sign_contract(contract_id: uuid.UUID, payload: ContractSign, db: AsyncSession = Depends(get_db)):
    contract = await crud.get(db, contract_id)
    if contract.status == ContractStatus.signed:
        raise ApiError.bad_request("Contract is already signed")

    now = datetime.now(timezone.utc)
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
                except ApiError:
                    raise
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
