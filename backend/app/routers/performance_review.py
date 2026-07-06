import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.crud.base import CRUDBase
from app.models.performance_review import PerformanceReview
from app.schemas.performance import PerformanceReviewCreate, PerformanceReviewOut, PerformanceReviewUpdate
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/performance-reviews", tags=["Performance Reviews"])

crud = CRUDBase(PerformanceReview, searchable_fields=["review_period"])


@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def list_reviews(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("employee_id", "status", "reviewer_id") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[PerformanceReviewOut.model_validate(r) for r in items], message="Reviews fetched", meta=meta)


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "hr"))])
async def create_review(payload: PerformanceReviewCreate, db: AsyncSession = Depends(get_db)):
    review = await crud.create(db, payload.model_dump())
    return success_response(data=PerformanceReviewOut.model_validate(review), message="Review created", status_code=201)


@router.get("/{review_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def get_review(review_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    review = await crud.get(db, review_id)
    return success_response(data=PerformanceReviewOut.model_validate(review))


@router.put("/{review_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def update_review(review_id: uuid.UUID, payload: PerformanceReviewUpdate, db: AsyncSession = Depends(get_db)):
    review = await crud.update(db, review_id, payload.model_dump(exclude_unset=True))
    return success_response(data=PerformanceReviewOut.model_validate(review), message="Review updated")


@router.delete("/{review_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_review(review_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, review_id)
    return success_response(message="Review deleted")
