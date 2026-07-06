from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.client import Client
from app.models.employee import Employee
from app.models.enums import UserRole
from app.models.project import Project
from app.models.service import Service
from app.models.user import User
from app.utils.responses import success_response

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("", response_model=dict)
async def get_stats(db: AsyncSession = Depends(get_db)):
    async def count(query):
        return (await db.execute(query)).scalar_one()

    total_services = await count(select(func.count()).select_from(Service))
    total_projects = await count(select(func.count()).select_from(Project).where(Project.status != "deleted"))
    active_projects = await count(select(func.count()).select_from(Project).where(Project.status == "in_progress"))
    total_employees = await count(select(func.count()).select_from(Employee).where(Employee.status == "active"))
    total_clients = await count(select(func.count()).select_from(Client))
    total_employee_users = await count(
        select(func.count()).select_from(User).where(User.role == UserRole.employee)
    )
    total_client_users = await count(
        select(func.count()).select_from(User).where(User.role == UserRole.client)
    )

    return success_response(
        data={
            "total_services": total_services,
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_employees": total_employees,
            "total_clients": total_clients,
            "total_employee_users": total_employee_users,
            "total_client_users": total_client_users,
            "countries": 18,
            "uptime": 99.8,
        },
        message="Stats fetched",
    )
