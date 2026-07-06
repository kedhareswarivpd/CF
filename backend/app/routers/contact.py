import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.crud.base import CRUDBase
from app.models.contact_submission import ContactSubmission
from app.schemas.contact import ContactOut, ContactStatusUpdate, ContactSubmit
from app.services.email_service import send_contact_notification
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/contact", tags=["Contact"])

crud = CRUDBase(ContactSubmission, searchable_fields=["name", "email", "company"])


@router.post("", response_model=dict, status_code=201)
async def submit(payload: ContactSubmit, db: AsyncSession = Depends(get_db)):
    submission = await crud.create(db, payload.model_dump())
    await send_contact_notification(submission.name, submission.email, submission.message, submission.subject)
    return success_response(message="Thank you for reaching out — our team will get back to you shortly.", status_code=201)


@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin", "sales", "support"))])
async def list_submissions(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("department", "status") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ContactOut.model_validate(s) for s in items], message="Submissions fetched", meta=meta)


@router.patch("/{submission_id}/status", response_model=dict, dependencies=[Depends(require_roles("admin", "sales", "support"))])
async def update_status(submission_id: uuid.UUID, payload: ContactStatusUpdate, db: AsyncSession = Depends(get_db)):
    submission = await crud.update(db, submission_id, payload.model_dump())
    return success_response(data=ContactOut.model_validate(submission), message="Status updated")
