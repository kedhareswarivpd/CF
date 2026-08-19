import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.attendance import Attendance
from app.models.department import Department
from app.models.employee import Employee
from app.models.employee_document import EmployeeDocument
from app.models.leave import Leave
from app.models.payslip import Payslip
from app.models.performance_review import PerformanceReview
from app.models.timesheet import Timesheet
from app.models.user import User
from app.models.enums import LeaveStatus
from app.schemas.employee import (
    AttendanceOut, EmployeeCreate, EmployeeDocumentOut,
    EmployeeOut, LeaveApply, LeaveOut, LeaveStatusUpdate,
    PayslipOut, TimesheetCreate, TimesheetOut, TimesheetStatusUpdate,
)
from app.schemas.performance import PerformanceReviewOut
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/employees", tags=["Employees"], dependencies=[Depends(get_current_user)])

crud = CRUDBase(Employee, searchable_fields=["employee_code", "designation"], relationships=["department"])
leave_crud = CRUDBase(Leave)
timesheet_crud = CRUDBase(Timesheet)


EMPLOYEE_ROLES = {"employee", "developer", "sales", "marketing", "project_manager", "qa", "support", "finance", "hr", "admin", "super_admin"}


async def _get_employee_for_user(db: AsyncSession, user: User) -> Employee:
    employee = (await db.execute(select(Employee).where(Employee.user_id == user.id))).scalar_one_or_none()
    if not employee:
        if user.role not in EMPLOYEE_ROLES:
            raise ApiError.not_found("Employee profile not found")
        # Auto-create a profile for existing users who don't have one yet
        short_id = str(user.id).replace("-", "")[:8].upper()
        employee = Employee(user_id=user.id, employee_code=f"EMP-{short_id}")
        db.add(employee)
        await db.commit()
        await db.refresh(employee)
    return employee


# ---------- Self-service (Employee Portal) ----------
@router.get("/me/profile", response_model=dict)
async def my_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    emp_data = EmployeeOut.model_validate(employee).model_dump()
    emp_data["name"] = current_user.name
    emp_data["email"] = current_user.email
    emp_data["role"] = current_user.role
    if employee.department_id:
        dept = (await db.execute(select(Department).where(Department.id == employee.department_id))).scalar_one_or_none()
        emp_data["department_name"] = dept.name if dept else None
    return success_response(data=emp_data)


@router.get("/me/attendance/today", response_model=dict)
async def today_attendance(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    today = date.today()
    record = (
        await db.execute(select(Attendance).where(Attendance.employee_id == employee.id, Attendance.date == today))
    ).scalar_one_or_none()
    if not record:
        return success_response(data=None)
    return success_response(data=AttendanceOut.model_validate(record))


@router.post("/me/attendance/check-in", response_model=dict)
async def check_in(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    today = date.today()
    record = (
        await db.execute(select(Attendance).where(Attendance.employee_id == employee.id, Attendance.date == today))
    ).scalar_one_or_none()
    if not record:
        record = Attendance(employee_id=employee.id, date=today, check_in=datetime.now(timezone.utc).time(), status="present")
        db.add(record)
        await db.commit()
        await db.refresh(record)
    return success_response(data=AttendanceOut.model_validate(record), message="Checked in")


@router.post("/me/attendance/check-out", response_model=dict)
async def check_out(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    today = date.today()
    record = (
        await db.execute(select(Attendance).where(Attendance.employee_id == employee.id, Attendance.date == today))
    ).scalar_one_or_none()
    if not record:
        raise ApiError.bad_request("You have not checked in today")
    record.check_out = datetime.now(timezone.utc).time()
    await db.commit()
    await db.refresh(record)
    return success_response(data=AttendanceOut.model_validate(record), message="Checked out")


@router.get("/me/leaves", response_model=dict)
async def my_leaves(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    result = await db.execute(select(Leave).where(Leave.employee_id == employee.id).order_by(Leave.id.desc()))
    return success_response(data=[LeaveOut.model_validate(l) for l in result.scalars().all()])


@router.post("/me/leaves", response_model=dict, status_code=201)
async def apply_leave(payload: LeaveApply, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    leave = Leave(
        employee_id=employee.id,
        type=payload.type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status="pending",
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return success_response(data=LeaveOut.model_validate(leave), message="Leave request submitted", status_code=201)


@router.get("/me/timesheets", response_model=dict)
async def my_timesheets(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    result = await db.execute(select(Timesheet).where(Timesheet.employee_id == employee.id).order_by(Timesheet.date.desc()))
    return success_response(data=[TimesheetOut.model_validate(t) for t in result.scalars().all()])


@router.post("/me/timesheets", response_model=dict, status_code=201)
async def submit_timesheet(payload: TimesheetCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    entry = Timesheet(**payload.model_dump(), employee_id=employee.id)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return success_response(data=TimesheetOut.model_validate(entry), message="Timesheet entry logged", status_code=201)


@router.get("/me/payslips", response_model=dict)
async def my_payslips(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    result = await db.execute(
        select(Payslip).where(Payslip.employee_id == employee.id).order_by(Payslip.year.desc(), Payslip.month.desc())
    )
    payslips = result.scalars().all()
    return success_response(data=[PayslipOut.model_validate(p) for p in payslips])


@router.get("/me/documents", response_model=dict)
async def my_documents(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    result = await db.execute(select(EmployeeDocument).where(EmployeeDocument.employee_id == employee.id))
    return success_response(data=[EmployeeDocumentOut.model_validate(d) for d in result.scalars().all()])


@router.get("/me/performance-reviews", response_model=dict)
async def my_performance_reviews(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    result = await db.execute(
        select(PerformanceReview).where(PerformanceReview.employee_id == employee.id).order_by(PerformanceReview.review_date.desc())
    )
    return success_response(data=[PerformanceReviewOut.model_validate(r) for r in result.scalars().all()])


# ---------- Leave & timesheet approval (HR reviews all; PM reviews their team's) ----------
# NOTE: These static routes MUST be registered before /{employee_id} to avoid
# FastAPI matching the literal string "leaves"/"timesheets" as a UUID path param.
@router.get("/leaves", response_model=dict, dependencies=[Depends(require_roles("admin", "hr", "project_manager"))])
async def list_leaves(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    status_filter = request.query_params.get("status")
    employee_id_filter = request.query_params.get("employee_id")
    stmt = select(Leave).options(selectinload(Leave.employee))
    if status_filter:
        try:
            stmt = stmt.where(Leave.status == LeaveStatus(status_filter))
        except ValueError:
            pass
    if employee_id_filter:
        stmt = stmt.where(Leave.employee_id == employee_id_filter)
    stmt = stmt.order_by(Leave.id.desc()).offset((page.page - 1) * page.limit).limit(page.limit)
    result = await db.execute(stmt)
    items = result.scalars().all()
    count_stmt = select(func.count()).select_from(Leave)
    if status_filter:
        try:
            count_stmt = count_stmt.where(Leave.status == LeaveStatus(status_filter))
        except ValueError:
            pass
    if employee_id_filter:
        count_stmt = count_stmt.where(Leave.employee_id == employee_id_filter)
    total = (await db.execute(count_stmt)).scalar_one()
    meta = build_pagination_meta(total, page.page, page.limit)
    data = []
    for l in items:
        out = LeaveOut.model_validate(l)
        out_dict = out.model_dump()
        out_dict["employee_code"] = l.employee.employee_code if l.employee else None
        out_dict["designation"] = l.employee.designation if l.employee else None
        data.append(out_dict)
    return success_response(data=data, message="Leave requests fetched", meta=meta)


@router.patch("/leaves/{leave_id}/approve", response_model=dict, dependencies=[Depends(require_roles("admin", "hr", "project_manager"))])
async def review_leave(leave_id: uuid.UUID, payload: LeaveStatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    leave = await leave_crud.update(db, leave_id, {"status": payload.status, "approved_by": current_user.id})
    return success_response(data=LeaveOut.model_validate(leave), message="Leave request updated")


@router.get("/timesheets", response_model=dict, dependencies=[Depends(require_roles("admin", "hr", "project_manager"))])
async def list_all_timesheets(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("employee_id", "project_id", "status") if request.query_params.get(k)}
    stmt = select(Timesheet).options(selectinload(Timesheet.employee))
    count_stmt = select(func.count()).select_from(Timesheet)
    for field, value in filters.items():
        column = getattr(Timesheet, field, None)
        if column is not None:
            stmt = stmt.where(column == value)
            count_stmt = count_stmt.where(column == value)
    stmt = stmt.order_by(Timesheet.date.desc()).offset((page.page - 1) * page.limit).limit(page.limit)
    result = await db.execute(stmt)
    items = result.scalars().all()
    total = (await db.execute(count_stmt)).scalar_one()
    meta = build_pagination_meta(total, page.page, page.limit)
    data = []
    for t in items:
        out = TimesheetOut.model_validate(t).model_dump()
        emp = t.employee
        out["employee_code"] = emp.employee_code if emp else None
        out["designation"] = emp.designation if emp else None
        user = (await db.execute(select(User).where(User.id == emp.user_id))).scalar_one_or_none() if emp else None
        out["employee_name"] = user.name if user else None
        data.append(out)
    return success_response(data=data, message="Timesheets fetched", meta=meta)


@router.patch("/timesheets/{timesheet_id}/approve", response_model=dict, dependencies=[Depends(require_roles("admin", "hr", "project_manager"))])
async def review_timesheet(timesheet_id: uuid.UUID, payload: TimesheetStatusUpdate, db: AsyncSession = Depends(get_db)):
    timesheet = await timesheet_crud.update(db, timesheet_id, {"status": payload.status})
    return success_response(data=TimesheetOut.model_validate(timesheet), message="Timesheet updated")


# ---------- HR / Admin management ----------
@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin", "hr", "project_manager"))])
async def list_employees(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("department_id", "status", "employment_type") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    data = []
    for e in items:
        out = EmployeeOut.model_validate(e).model_dump()
        if e.department_id:
            dept = (await db.execute(select(Department).where(Department.id == e.department_id))).scalar_one_or_none()
            out["department_name"] = dept.name if dept else None
        else:
            out["department_name"] = None
        user = (await db.execute(select(User).where(User.id == e.user_id))).scalar_one_or_none()
        out["name"] = user.name if user else None
        out["email"] = user.email if user else None
        data.append(out)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=data, message="Employees fetched", meta=meta)


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "hr"))])
async def create_employee(payload: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True)
    user_id = data.get("user_id")
    if user_id:
        existing = (await db.execute(select(Employee).where(Employee.user_id == user_id))).scalar_one_or_none()
        if existing:
            for k, v in data.items():
                setattr(existing, k, v)
            await db.commit()
            await db.refresh(existing)
            return success_response(data=EmployeeOut.model_validate(existing), message="Employee profile updated successfully", status_code=201)
    employee = await crud.create(db, data)
    return success_response(data=EmployeeOut.model_validate(employee), message="Employee created successfully", status_code=201)

