import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.crud.base import CRUDBase
from app.models.enums import NotificationType
from app.models.lead import Lead
from app.models.user import User
from app.schemas.crm import LeadCreate, LeadOut, LeadUpdate
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
    return success_response(data=[LeadOut.model_validate(l) for l in items], message="Leads fetched", meta=meta)


@router.get("/{lead_id}", response_model=dict)
async def get_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    lead = await crud.get(db, lead_id)
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
    data = payload.model_dump(exclude_unset=True)
    previous_owner = (await crud.get(db, lead_id)).owner_id
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
