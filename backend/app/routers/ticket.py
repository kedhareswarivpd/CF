import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.crud.base import CRUDBase
from app.models.ticket import Ticket
from app.models.ticket_reply import TicketReply
from app.models.user import User
from app.schemas.ops import TicketOut, TicketReplyCreate, TicketReplyOut, TicketUpdate
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/tickets", tags=["Tickets"], dependencies=[Depends(require_roles("admin", "support"))])

crud = CRUDBase(Ticket, searchable_fields=["subject", "ticket_number"])


@router.get("", response_model=dict)
async def list_tickets(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("status", "priority", "assigned_to", "client_id") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[TicketOut.model_validate(t) for t in items], message="Tickets fetched", meta=meta)


@router.get("/{ticket_id}", response_model=dict)
async def get_ticket(ticket_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).options(selectinload(Ticket.replies)).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        from app.core.errors import ApiError
        raise ApiError.not_found("Ticket not found")
    return success_response(data=TicketOut.model_validate(ticket))


@router.patch("/{ticket_id}", response_model=dict)
async def update_ticket(ticket_id: uuid.UUID, payload: TicketUpdate, db: AsyncSession = Depends(get_db)):
    ticket = await crud.update(db, ticket_id, payload.model_dump(exclude_unset=True))
    return success_response(data=TicketOut.model_validate(ticket), message="Ticket updated")


@router.post("/{ticket_id}/replies", response_model=dict, status_code=201)
async def add_reply(ticket_id: uuid.UUID, payload: TicketReplyCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await crud.get(db, ticket_id)  # 404s if missing
    reply = TicketReply(**payload.model_dump(), ticket_id=ticket_id, user_id=current_user.id)
    db.add(reply)
    await db.commit()
    await db.refresh(reply)
    return success_response(data=TicketReplyOut.model_validate(reply), message="Reply added", status_code=201)
