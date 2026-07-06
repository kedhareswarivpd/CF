import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import Leave
from app.models.payslip import Payslip
from app.models.timesheet import Timesheet
from app.models.user import User
from app.schemas.employee import (
    AttendanceOut, EmployeeCreate, EmployeeOut, EmployeeUpdate, LeaveApply,
    LeaveOut, PayslipOut, TimesheetCreate, TimesheetOut,
)
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/employees", tags=["Employees"], dependencies=[Depends(get_current_user)])

crud = CRUDBase(Employee, searchable_fields=["employee_code", "designation"], relationships=["department"])


async def _get_employee_for_user(db: AsyncSession, user: User) -> Employee:
    employee = (await db.execute(select(Employee).where(Employee.user_id == user.id))).scalar_one_or_none()
    if not employee:
        raise ApiError.not_found("Employee profile not found")
    return employee


# ---------- Self-service (Employee Portal) ----------
@router.get("/me/profile", response_model=dict)
async def my_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    return success_response(data=EmployeeOut.model_validate(employee))


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


@router.post("/me/leaves", response_model=dict, status_code=201)
async def apply_leave(payload: LeaveApply, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = await _get_employee_for_user(db, current_user)
    leave = Leave(**payload.model_dump(), employee_id=employee.id, status="pending")
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return success_response(data=LeaveOut.model_validate(leave), message="Leave request submitted", status_code=201)


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


# ---------- HR / Admin management ----------
@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def list_employees(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("department_id", "status", "employment_type") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[EmployeeOut.model_validate(e) for e in items], message="Employees fetched", meta=meta)


@router.get("/{employee_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "hr", "project_manager"))])
async def get_employee(employee_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    employee = await crud.get(db, employee_id)
    return success_response(data=EmployeeOut.model_validate(employee))


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "hr"))])
async def create_employee(payload: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    employee = await crud.create(db, payload.model_dump())
    return success_response(data=EmployeeOut.model_validate(employee), message="Employee created successfully", status_code=201)


@router.put("/{employee_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def update_employee(employee_id: uuid.UUID, payload: EmployeeUpdate, db: AsyncSession = Depends(get_db)):
    employee = await crud.update(db, employee_id, payload.model_dump(exclude_unset=True))
    return success_response(data=EmployeeOut.model_validate(employee), message="Employee updated successfully")


@router.delete("/{employee_id}", response_model=dict, dependencies=[Depends(require_roles("admin", "hr"))])
async def delete_employee(employee_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, employee_id)
    return success_response(message="Employee removed successfully")
