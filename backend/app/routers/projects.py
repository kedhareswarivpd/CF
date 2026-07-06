import uuid

from fastapi import APIRouter, Depends, Request
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_user, require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.project import Project
from app.models.user import User
from app.schemas.project import AssignTeamRequest, ProjectCreate, ProjectOut, ProjectUpdate
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/projects", tags=["Projects"])

crud = CRUDBase(Project, searchable_fields=["title", "industry"])


@router.get("", response_model=dict)
async def list_projects(
    request: Request,
    db: AsyncSession = Depends(get_db),
    page: PageParams = Depends(page_params),
    current_user: User | None = Depends(get_optional_user),
):
    filters = {k: request.query_params.get(k) for k in ("status", "client_id", "industry") if request.query_params.get(k)}
    if is_featured := request.query_params.get("is_featured"):
        filters["is_featured"] = is_featured.lower() == "true"
    if current_user is None:
        filters["is_published"] = True  # public callers only ever see published projects
    elif is_published := request.query_params.get("is_published"):
        filters["is_published"] = is_published.lower() == "true"

    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ProjectOut.model_validate(p) for p in items], message="Projects fetched", meta=meta)


@router.get("/{identifier}", response_model=dict)
async def get_project(identifier: str, db: AsyncSession = Depends(get_db), current_user: User | None = Depends(get_optional_user)):
    try:
        project_id = uuid.UUID(identifier)
        query = select(Project).where(Project.id == project_id)
    except ValueError:
        query = select(Project).where(Project.slug == identifier)

    try:
        project = (await db.execute(query)).scalar_one_or_none()
    except Exception as exc:
        logger.warning("Database query failed while loading project: %s", exc)
        raise ApiError.not_found("Project not found") from exc

    if not project or (current_user is None and not project.is_published):
        raise ApiError.not_found("Project not found")
    return success_response(data=ProjectOut.model_validate(project))


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def create_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    data["slug"] = data.get("slug") or slugify(data["title"])
    project = await crud.create(db, data)
    return success_response(data=ProjectOut.model_validate(project), message="Project created successfully", status_code=201)


@router.put("/{project_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def update_project(project_id: uuid.UUID, payload: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    project = await crud.update(db, project_id, payload.model_dump(exclude_unset=True))
    return success_response(data=ProjectOut.model_validate(project), message="Project updated successfully")


@router.patch("/{project_id}/team", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def assign_team(project_id: uuid.UUID, payload: AssignTeamRequest, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    from app.models.employee import Employee

    result = await db.execute(select(Project).options(selectinload(Project.team)).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise ApiError.not_found("Project not found")

    employees = (await db.execute(select(Employee).where(Employee.id.in_(payload.employee_ids)))).scalars().all()
    project.team = list(employees)
    await db.commit()
    return success_response(message="Project team updated")


@router.delete("/{project_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, project_id)
    return success_response(message="Project deleted successfully")
