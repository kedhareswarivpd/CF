import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.client import Client
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.project import Project
from app.models.ticket import Ticket
from app.models.ticket_reply import TicketReply
from app.models.user import User
from app.schemas.client import ClientCreate, ClientOut, ClientUpdate, TicketCreate
from app.schemas.finance import InvoiceOut
from app.schemas.ops import TicketOut
from app.schemas.project import ProjectOut
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/clients", tags=["Clients"], dependencies=[Depends(get_current_user)])

crud = CRUDBase(Client, searchable_fields=["company_name", "country"])


async def _get_client_for_user(db: AsyncSession, user: User) -> Client:
    client = (await db.execute(select(Client).where(Client.user_id == user.id))).scalar_one_or_none()
    if not client:
        raise ApiError.not_found("Client profile not found")
    return client


# ---------- Client self-service (Client Portal) ----------
@router.get("/me/profile", response_model=dict)
async def my_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    return success_response(data=ClientOut.model_validate(client))


@router.get("/me/projects", response_model=dict)
async def my_projects(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(select(Project).where(Project.client_id == client.id).order_by(Project.created_at.desc()))
    return success_response(data=[ProjectOut.model_validate(p) for p in result.scalars().all()])


@router.get("/me/invoices", response_model=dict)
async def my_invoices(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(
        select(Invoice).where(Invoice.client_id == client.id).order_by(Invoice.issue_date.desc())
    )
    return success_response(data=[InvoiceOut.model_validate(i) for i in result.scalars().all()])


@router.get("/me/tickets", response_model=dict)
async def my_tickets(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(select(Ticket).where(Ticket.client_id == client.id).order_by(Ticket.created_at.desc()))
    return success_response(data=[TicketOut.model_validate(t) for t in result.scalars().all()])


@router.post("/me/tickets", response_model=dict, status_code=201)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    ticket_number = f"TCK-{int(datetime.utcnow().timestamp())}"
    ticket = Ticket(**payload.model_dump(), client_id=client.id, ticket_number=ticket_number)
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return success_response(data=TicketOut.model_validate(ticket), message="Support ticket created", status_code=201)


# ---------- Admin / Sales management ----------
@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin", "sales"))])
async def list_clients(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {}
    if industry := request.query_params.get("industry"):
        filters["industry"] = industry
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ClientOut.model_validate(c) for c in items], message="Clients fetched", meta=meta)


@router.get("/{client_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "sales", "project_manager"))])
async def get_client(client_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    client = await crud.get(db, client_id)
    return success_response(data=ClientOut.model_validate(client))


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "sales"))])
async def create_client(payload: ClientCreate, db: AsyncSession = Depends(get_db)):
    client = await crud.create(db, payload.model_dump())
    return success_response(data=ClientOut.model_validate(client), message="Client created successfully", status_code=201)


@router.put("/{client_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "sales"))])
async def update_client(client_id: uuid.UUID, payload: ClientUpdate, db: AsyncSession = Depends(get_db)):
    client = await crud.update(db, client_id, payload.model_dump(exclude_unset=True))
    return success_response(data=ClientOut.model_validate(client), message="Client updated successfully")


@router.delete("/{client_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_client(client_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, client_id)
    return success_response(message="Client removed successfully")
