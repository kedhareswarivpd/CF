import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.crud.base import CRUDBase
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskOut, TaskStatusUpdate
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/tasks", tags=["Tasks"], dependencies=[Depends(get_current_user)])

crud = CRUDBase(Task, searchable_fields=["title"])


@router.get("", response_model=dict)
async def list_tasks(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("project_id", "assigned_to", "status", "priority") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[TaskOut.model_validate(t) for t in items], message="Tasks fetched", meta=meta)


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    task = await crud.create(db, payload.model_dump())
    return success_response(data=TaskOut.model_validate(task), message="Task created successfully", status_code=201)


@router.patch("/{task_id}/status", response_model=dict)
async def update_task_status(task_id: uuid.UUID, payload: TaskStatusUpdate, db: AsyncSession = Depends(get_db)):
    task = await crud.update(db, task_id, payload.model_dump())
    return success_response(data=TaskOut.model_validate(task), message="Task status updated")
