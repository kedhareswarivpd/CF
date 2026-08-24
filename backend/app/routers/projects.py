import uuid

from fastapi import APIRouter, Depends, Request, Response
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_user, is_staff, require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.associations import project_members
from app.models.lead import Lead
from app.models.project import Project
from app.models.project_update import ProjectUpdate as ProjectUpdateModel
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.project import AssignTeamRequest, ProjectCreate, ProjectOut, ProjectUpdate
from app.schemas.project_update import ProjectUpdateCreate, ProjectUpdateOut, ProjectUpdateVisibility
from app.utils.pagination import PageParams, apply_sort, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/projects", tags=["Projects"])

crud = CRUDBase(Project, searchable_fields=["title", "industry"], relationships=["team"])



@router.get("", response_model=dict)
async def list_projects(
    request: Request,
    db: AsyncSession = Depends(get_db),
    page: PageParams = Depends(page_params),
    current_user: User | None = Depends(get_optional_user),
):
    filters = {k: request.query_params.get(k) for k in ("status", "client_id", "industry", "project_manager_id") if request.query_params.get(k)}
    if is_featured := request.query_params.get("is_featured"):
        filters["is_featured"] = is_featured.lower() == "true"
    # UAT closure pass §14 (RBAC matrix): this branch only checked
    # `current_user is None` — ANY authenticated caller, including a
    # `client`, was treated as staff and got the full internal ProjectOut
    # (budget, team roster with user_ids, architecture_notes, every
    # client's projects, not scoped to their own) with no role check at
    # all. Live UAT caught a client account pulling this endpoint
    # unfiltered. Clients have their own scoped `/clients/me/projects`
    # (ClientProjectOut) — they must never reach this one as anything but
    # the public/anonymous view.
    if current_user is None or current_user.role == "client":
        filters["is_published"] = True  # public/client callers only ever see published projects
    elif is_published := request.query_params.get("is_published"):
        filters["is_published"] = is_published.lower() == "true"

    employee_filter = request.query_params.get("employee_id")
    if employee_filter:
        from app.models.employee import Employee
        try:
            emp_uuid = uuid.UUID(employee_filter)
            emp = await db.get(Employee, emp_uuid)
            emp_user_id = emp.user_id if emp else None
        except (ValueError, TypeError):
            emp_user_id = None

        if emp_user_id:
            query = select(Project).outerjoin(project_members, project_members.c.project_id == Project.id).where(
                (project_members.c.employee_id == emp_uuid) | (Project.project_manager_id == emp_user_id)
            )
            count_query = select(func.count(func.distinct(Project.id))).outerjoin(project_members, project_members.c.project_id == Project.id).where(
                (project_members.c.employee_id == emp_uuid) | (Project.project_manager_id == emp_user_id)
            )
        else:
            query = select(Project).join(project_members, project_members.c.project_id == Project.id).where(project_members.c.employee_id == employee_filter)
            count_query = select(func.count()).select_from(project_members).where(project_members.c.employee_id == employee_filter)

        query = crud._with_relationships(query)
        query = apply_sort(
            query,
            Project,
            page.sort,
            allowed_fields={
                "title",
                "status",
                "created_at",
                "updated_at",
                "start_date",
                "end_date",
                "budget",
                "progress_percent",
                "industry",
                "is_featured",
                "is_published",
            },
        )
        query = query.limit(page.limit).offset(page.offset)
        result = await db.execute(query)
        total = (await db.execute(count_query)).scalar_one()
        meta = build_pagination_meta(total, page.page, page.limit)
        return success_response(data=[ProjectOut.model_validate(p) for p in result.scalars().unique().all()], message="Projects fetched", meta=meta)


    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ProjectOut.model_validate(p) for p in items], message="Projects fetched", meta=meta)


@router.get("/{identifier}", response_model=dict)
async def get_project(identifier: str, db: AsyncSession = Depends(get_db), current_user: User | None = Depends(get_optional_user)):
    # ProjectOut serializes `team` — without eager-loading it, Pydantic's lazy
    # attribute access crashes with MissingGreenlet outside a live session
    # context on any project that actually has team members assigned. Only
    # ever caught against a real Postgres session (mocked tests can't
    # reproduce SQLAlchemy's async lazy-load behavior) — found via
    # tests/e2e_workflows.py.
    from sqlalchemy.orm import selectinload
    try:
        project_id = uuid.UUID(identifier)
        query = select(Project).options(selectinload(Project.team)).where(Project.id == project_id)
    except ValueError:
        query = select(Project).options(selectinload(Project.team)).where(Project.slug == identifier)

    try:
        project = (await db.execute(query)).scalar_one_or_none()
    except Exception as exc:
        logger.warning("Database query failed while loading project: %s", exc)
        raise ApiError.not_found("Project not found") from exc

    if not project or (not project.is_published and not is_staff(current_user, "admin", "super_admin", "project_manager", "marketing")):
        raise ApiError.not_found("Project not found")
    return success_response(data=ProjectOut.model_validate(project))


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def create_project(payload: ProjectCreate, response: Response, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    data = payload.model_dump()

    # UAT closure pass, section 1: enforce Project.client == Proposal's
    # converted client (Phase 45's "Project Client = Proposal Client"
    # consistency rule) and treat re-creating a project for an
    # already-linked proposal as an idempotent no-op rather than either
    # silently allowing a duplicate or hard-erroring — same pattern as
    # finance.py's duplicate-payment handling elsewhere in this codebase.
    if data.get("proposal_id"):
        existing = (await db.execute(select(Project).where(Project.proposal_id == data["proposal_id"]))).scalar_one_or_none()
        if existing is not None:
            response.status_code = 200
            res = await db.execute(select(Project).options(selectinload(Project.team)).where(Project.id == existing.id))
            return success_response(
                data=ProjectOut.model_validate(res.scalar_one()),
                message="A project already exists for this proposal", status_code=200,
            )

        proposal = (await db.execute(select(Proposal).where(Proposal.id == data["proposal_id"]))).scalar_one_or_none()
        if proposal is None:
            raise ApiError.bad_request("Proposal not found")
        lead = (await db.execute(select(Lead).where(Lead.id == proposal.lead_id))).scalar_one_or_none()
        if lead is None or lead.converted_client_id is None:
            raise ApiError.bad_request("This proposal's lead has not converted to a client yet")
        if data.get("client_id") and str(data["client_id"]) != str(lead.converted_client_id):
            raise ApiError.bad_request("client_id does not match the proposal's converted client")
        data["client_id"] = lead.converted_client_id

    data["slug"] = data.get("slug") or slugify(data["title"])
    project = await crud.create(db, data)
    res = await db.execute(select(Project).options(selectinload(Project.team)).where(Project.id == project.id))
    loaded = res.scalar_one()
    return success_response(data=ProjectOut.model_validate(loaded), message="Project created successfully", status_code=201)


def _require_own_project_or_admin(current_user: User, project: Project) -> None:
    """Real gap found during a security audit: any `project_manager` could
    edit or reassign the team of ANY project, not just the ones they
    actually manage — a horizontal privilege escalation within the
    project_manager role, the same class of issue already fixed for
    clients/partners (account_manager_id) and leaves/timesheets
    (reporting_manager_id)."""
    if current_user.role in ("admin", "super_admin"):
        return
    if project.project_manager_id != current_user.id:
        raise ApiError.forbidden("You can only manage projects you are assigned as the project manager for")


@router.put("/{project_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def update_project(project_id: uuid.UUID, payload: ProjectUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy.orm import selectinload
    existing = await crud.get(db, project_id)
    _require_own_project_or_admin(current_user, existing)
    project = await crud.update(db, project_id, payload.model_dump(exclude_unset=True))
    res = await db.execute(select(Project).options(selectinload(Project.team)).where(Project.id == project.id))
    loaded = res.scalar_one()
    return success_response(data=ProjectOut.model_validate(loaded), message="Project updated successfully")


@router.patch("/{project_id}/team", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def assign_team(project_id: uuid.UUID, payload: AssignTeamRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy.orm import selectinload

    from app.models.employee import Employee

    result = await db.execute(select(Project).options(selectinload(Project.team)).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise ApiError.not_found("Project not found")
    _require_own_project_or_admin(current_user, project)

    employees = (await db.execute(
        select(Employee).where((Employee.id.in_(payload.employee_ids)) | (Employee.user_id.in_(payload.employee_ids)))
    )).scalars().all()
    project.team = list(employees)
    await db.commit()
    return success_response(message="Project team updated")



@router.delete("/{project_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, project_id)
    return success_response(message="Project deleted successfully")


# ---------- Daily Project Updates (workflow doc §8, §16) ----------
async def _employee_on_project(db: AsyncSession, project_id: uuid.UUID, current_user: User):
    from app.models.employee import Employee
    employee = (await db.execute(select(Employee).where(Employee.user_id == current_user.id))).scalar_one_or_none()
    if employee is None:
        return None
    is_member = (await db.execute(
        select(project_members.c.employee_id).where(
            project_members.c.project_id == project_id, project_members.c.employee_id == employee.id,
        )
    )).scalar_one_or_none()
    return employee if is_member else None


@router.post("/{project_id}/updates", response_model=dict, status_code=201)
async def post_project_update(
    project_id: uuid.UUID, payload: ProjectUpdateCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    """Employee posts a dated progress note against a project they're
    actually assigned to — not any project (workflow doc §8: "Employee can
    create an update only for an authorized project")."""
    project = await crud.get(db, project_id)
    employee = await _employee_on_project(db, project_id, current_user)
    if employee is None:
        if current_user.role in ("admin", "super_admin") or (current_user.role == "project_manager" and project.project_manager_id == current_user.id):
            # Staff/PM posting on behalf of the team is allowed, but there's
            # no Employee row to attribute it to unless they're also on the
            # team — resolve their own Employee row if they have one, else
            # reject rather than attribute the update to nobody.
            from app.models.employee import Employee
            employee = (await db.execute(select(Employee).where(Employee.user_id == current_user.id))).scalar_one_or_none()
        if employee is None:
            raise ApiError.forbidden("You are not assigned to this project")

    update = ProjectUpdateModel(project_id=project_id, employee_id=employee.id, update_text=payload.update_text, hours_logged=payload.hours_logged)
    db.add(update)
    await db.commit()
    await db.refresh(update)
    return success_response(data=ProjectUpdateOut.model_validate(update), message="Update posted", status_code=201)


@router.get("/{project_id}/updates", response_model=dict)
async def list_project_updates(project_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Internal view (PM sees the employee's update — workflow doc §8) —
    accessible to admin, the project's PM, or any employee on its team."""
    project = await crud.get(db, project_id)
    employee = await _employee_on_project(db, project_id, current_user)
    is_pm_or_admin = current_user.role in ("admin", "super_admin") or (current_user.role == "project_manager" and project.project_manager_id == current_user.id)
    if employee is None and not is_pm_or_admin:
        raise ApiError.forbidden("You are not assigned to this project")

    result = await db.execute(
        select(ProjectUpdateModel).where(ProjectUpdateModel.project_id == project_id).order_by(ProjectUpdateModel.created_at.desc())
    )
    return success_response(data=[ProjectUpdateOut.model_validate(u) for u in result.scalars().all()])


@router.patch("/{project_id}/updates/{update_id}/visibility", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def set_update_visibility(
    project_id: uuid.UUID, update_id: uuid.UUID, payload: ProjectUpdateVisibility,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    """PM/admin flags an update as client-visible — the "approved" subset
    the workflow doc says the client should see, distinct from internal
    task/technical detail (§16's Employee View vs Client View split)."""
    project = await crud.get(db, project_id)
    _require_own_project_or_admin(current_user, project)
    update = (await db.execute(select(ProjectUpdateModel).where(ProjectUpdateModel.id == update_id, ProjectUpdateModel.project_id == project_id))).scalar_one_or_none()
    if update is None:
        raise ApiError.not_found("Update not found")
    update.client_visible = payload.client_visible
    await db.commit()
    await db.refresh(update)
    return success_response(data=ProjectUpdateOut.model_validate(update), message="Update visibility changed")
