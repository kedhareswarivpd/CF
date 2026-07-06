import uuid
from datetime import date

from pydantic import BaseModel

from app.models.enums import EmployeeStatus, EmploymentType
from app.schemas.common import TimestampedRead


class EmployeeCreate(BaseModel):
    user_id: uuid.UUID
    employee_code: str
    department_id: uuid.UUID | None = None
    designation: str | None = None
    date_of_joining: date | None = None
    date_of_birth: date | None = None
    employment_type: EmploymentType = EmploymentType.full_time
    status: EmployeeStatus = EmployeeStatus.active
    office_location: str | None = None
    reporting_manager_id: uuid.UUID | None = None
    salary: float | None = None
    address: str | None = None


class EmployeeUpdate(BaseModel):
    department_id: uuid.UUID | None = None
    designation: str | None = None
    employment_type: EmploymentType | None = None
    status: EmployeeStatus | None = None
    office_location: str | None = None
    reporting_manager_id: uuid.UUID | None = None
    salary: float | None = None
    address: str | None = None


class EmployeeOut(TimestampedRead):
    user_id: uuid.UUID
    employee_code: str
    department_id: uuid.UUID | None = None
    designation: str | None = None
    date_of_joining: date | None = None
    date_of_birth: date | None = None
    employment_type: EmploymentType
    status: EmployeeStatus
    office_location: str | None = None
    reporting_manager_id: uuid.UUID | None = None
    salary: float | None = None
    address: str | None = None


class LeaveApply(BaseModel):
    type: str
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveOut(TimestampedRead):
    employee_id: uuid.UUID
    type: str
    start_date: date
    end_date: date
    reason: str | None = None
    status: str


class TimesheetCreate(BaseModel):
    project_id: uuid.UUID | None = None
    task_id: uuid.UUID | None = None
    date: date
    hours: float
    description: str | None = None


class TimesheetOut(TimestampedRead):
    employee_id: uuid.UUID
    project_id: uuid.UUID | None = None
    task_id: uuid.UUID | None = None
    date: date
    hours: float
    description: str | None = None
    status: str


class PayslipOut(TimestampedRead):
    employee_id: uuid.UUID
    month: int
    year: int
    basic: float
    allowances: float
    deductions: float
    net_pay: float
    file_url: str | None = None
    status: str


class AttendanceOut(TimestampedRead):
    employee_id: uuid.UUID
    date: date
    status: str
