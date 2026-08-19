import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.crud.base import CRUDBase
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.ops import MeetingCreate, MeetingOut, MeetingUpdate
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/meetings", tags=["Sales CRM — Meetings"], dependencies=[Depends(require_roles("admin", "sales", "project_manager"))])

crud = CRUDBase(Meeting, searchable_fields=["title", "agenda"])


@router.get("", response_model=dict)
async def list_meetings(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("status", "client_id", "project_id") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[MeetingOut.model_validate(m) for m in items], message="Meetings fetched", meta=meta)


@router.get("/{meeting_id}", response_model=dict)
async def get_meeting(meeting_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    meeting = await crud.get(db, meeting_id)
    return success_response(data=MeetingOut.model_validate(meeting))


@router.post("", response_model=dict, status_code=201)
async def create_meeting(payload: MeetingCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    data["organizer_id"] = current_user.id
    meeting = await crud.create(db, data)
    return success_response(data=MeetingOut.model_validate(meeting), message="Meeting created", status_code=201)


@router.patch("/{meeting_id}", response_model=dict)
async def update_meeting(meeting_id: uuid.UUID, payload: MeetingUpdate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True)
    meeting = await crud.update(db, meeting_id, data)
    return success_response(data=MeetingOut.model_validate(meeting), message="Meeting updated")


@router.delete("/{meeting_id}", response_model=dict)
async def cancel_meeting(meeting_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, meeting_id)
    return success_response(message="Meeting cancelled")
