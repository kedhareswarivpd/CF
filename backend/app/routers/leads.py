import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.client import Client
from app.models.enums import LeadStatus, NotificationType
from app.models.lead import Lead
from app.models.user import User
from app.schemas.client import ClientOut
from app.schemas.crm import LeadCreate, LeadOut, LeadUpdate
from app.services.client_provisioning import provision_client_account
from app.services.notification_service import notify_user
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/leads", tags=["CRM — Leads"], dependencies=[Depends(require_roles("sales", "marketing", "admin", "project_manager"))])

crud = CRUDBase(Lead, searchable_fields=["company", "contact_name", "email"])


@router.get("", response_model=dict)
async def list_leads(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params), current_user: User = Depends(get_current_user)):
    filters = {k: request.query_params.get(k) for k in ("status", "source") if request.query_params.get(k)}
    if current_user.role == "sales":
        filters["owner_id"] = current_user.id
    elif owner_id := request.query_params.get("owner_id"):
        filters["owner_id"] = owner_id
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[LeadOut.model_validate(lead) for lead in items], message="Leads fetched", meta=meta)


@router.get("/{lead_id}", response_model=dict)
async def get_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = await crud.get(db, lead_id)
    if current_user.role == "sales" and lead.owner_id != current_user.id:
        raise ApiError.forbidden("You do not have access to this lead")
    return success_response(data=LeadOut.model_validate(lead))


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("sales", "marketing", "admin"))])
async def create_lead(payload: LeadCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    if not data.get("owner_id") and current_user.role == "sales":
        data["owner_id"] = current_user.id
    lead = await crud.create(db, data)

    if lead.owner_id and lead.owner_id != current_user.id:
        await notify_user(
            db, lead.owner_id, "New lead assigned to you",
            f"{lead.company or lead.contact_name} was assigned to you as a new lead.",
            NotificationType.info, f"/employee-portal?tab=leads&lead={lead.id}",
        )
    return success_response(data=LeadOut.model_validate(lead), message="Lead created", status_code=201)


@router.patch("/{lead_id}", response_model=dict, dependencies=[Depends(require_roles("sales", "admin"))])
async def update_lead(lead_id: uuid.UUID, payload: LeadUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = await crud.get(db, lead_id)
    # Real IDOR found during a security audit: GET /leads/{id} already
    # blocked a `sales` user from reading a lead they don't own, but this
    # PATCH had no matching check — any sales user could modify (including
    # reassigning `owner_id` to themselves) a lead owned by a different
    # salesperson, exactly the class of access GET was written to prevent.
    if current_user.role == "sales" and existing.owner_id != current_user.id:
        raise ApiError.forbidden("You do not have access to this lead")
    data = payload.model_dump(exclude_unset=True)
    previous_owner = existing.owner_id
    lead = await crud.update(db, lead_id, data)

    new_owner = data.get("owner_id")
    if new_owner and str(new_owner) != str(previous_owner) and uuid.UUID(str(new_owner)) != current_user.id:
        await notify_user(
            db, lead.owner_id, "Lead reassigned to you",
            f"{lead.company or lead.contact_name} was reassigned to you.",
            NotificationType.info, f"/employee-portal?tab=leads&lead={lead.id}",
        )
    return success_response(data=LeadOut.model_validate(lead), message="Lead updated")


@router.delete("/{lead_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, lead_id)
    return success_response(message="Lead removed")


@router.post("/{lead_id}/convert", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def convert_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Explicit "Convert Lead to Client" action (workflow doc §3) — provisions
    the client's portal account and sends their credential email right after
    a successful lead evaluation, independent of any proposal/contract that
    may follow. Restricted to admin/PM per the doc's "credentials can be
    generated by an authorized user such as Admin or Project Manager".

    Idempotent by design (mirrors the auto-provisioning path contracts.py's
    sign_contract already uses for leads that convert via a signed contract
    instead): re-calling this on an already-converted lead just returns the
    existing client rather than erroring or provisioning a second account —
    a rapid double-click produces exactly one client either way.
    """
    lead = await crud.get(db, lead_id)

    if lead.status == LeadStatus.converted and lead.converted_client_id:
        existing = (await db.execute(select(Client).where(Client.id == lead.converted_client_id))).scalar_one_or_none()
        if existing is not None:
            return success_response(data=ClientOut.model_validate(existing), message="Lead was already converted to this client")

    try:
        client = await provision_client_account(db, lead)
    except Exception as exc:  # noqa: BLE001 — surfaced to the caller; unlike the contract-sign path there's no other side effect to protect here
        logger.error(f"Client account provisioning failed for lead {lead.id}: {exc}")
        raise ApiError.bad_request("Could not provision the client account. Please try again.") from exc

    if client is None:
        raise ApiError.bad_request("Could not provision the client account. Please try again.")

    await crud.update(db, lead.id, {"status": LeadStatus.converted, "converted_client_id": client.id})

    return success_response(data=ClientOut.model_validate(client), message="Lead converted to client", status_code=201)
