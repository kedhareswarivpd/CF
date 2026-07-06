import uuid

from fastapi import APIRouter, Depends
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.training import Course, TrainingEnrollment
from app.models.user import User
from app.schemas.training import CourseCreate, CourseOut, CourseUpdate, TrainingEnrollmentOut
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/trainings", tags=["Training"])

course_crud = CRUDBase(Course, searchable_fields=["title", "category"])


# ---------- Public / authenticated listing ----------
@router.get("/courses", response_model=dict)
async def list_courses(
    db: AsyncSession = Depends(get_db),
    page: PageParams = Depends(page_params),
):
    filters = {"is_published": True}
    items, total = await course_crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[CourseOut.model_validate(c) for c in items], message="Courses fetched", meta=meta)


@router.get("/courses/{course_id}", response_model=dict)
async def get_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    course = await course_crud.get(db, course_id)
    return success_response(data=CourseOut.model_validate(course))


# ---------- Admin CRUD ----------
@router.post("/courses", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "hr"))])
async def create_course(payload: CourseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    data["slug"] = data.get("slug") or slugify(data["title"])
    data["created_by"] = current_user.id
    course = await course_crud.create(db, data)
    return success_response(data=CourseOut.model_validate(course), message="Course created", status_code=201)


@router.put("/courses/{course_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def update_course(course_id: uuid.UUID, payload: CourseUpdate, db: AsyncSession = Depends(get_db)):
    course = await course_crud.update(db, course_id, payload.model_dump(exclude_unset=True))
    return success_response(data=CourseOut.model_validate(course), message="Course updated")


@router.delete("/courses/{course_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await course_crud.delete(db, course_id)
    return success_response(message="Course deleted")


# ---------- Employee enrollment (self-service) ----------
@router.post("/enroll", response_model=dict, status_code=201)
async def enroll(course_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.employee import Employee
    employee = (await db.execute(select(Employee).where(Employee.user_id == current_user.id))).scalar_one_or_none()
    if not employee:
        raise ApiError.not_found("Employee profile not found")

    existing = await db.execute(
        select(TrainingEnrollment).where(
            TrainingEnrollment.employee_id == employee.id,
            TrainingEnrollment.course_id == course_id,
        )
    )
    if existing.scalar_one_or_none():
        raise ApiError.conflict("Already enrolled in this course")

    enrollment = TrainingEnrollment(employee_id=employee.id, course_id=course_id)
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return success_response(data=TrainingEnrollmentOut.model_validate(enrollment), message="Enrolled successfully", status_code=201)


@router.get("/my-enrollments", response_model=dict)
async def my_enrollments(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.employee import Employee
    employee = (await db.execute(select(Employee).where(Employee.user_id == current_user.id))).scalar_one_or_none()
    if not employee:
        raise ApiError.not_found("Employee profile not found")
    result = await db.execute(
        select(TrainingEnrollment).options(selectinload(TrainingEnrollment.course))
        .where(TrainingEnrollment.employee_id == employee.id)
        .order_by(TrainingEnrollment.enrolled_at.desc())
    )
    return success_response(data=[TrainingEnrollmentOut.model_validate(e) for e in result.scalars().all()])
