import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.utils.responses import success_response

router = APIRouter(prefix="/users", tags=["GDPR"])
self_router = APIRouter(prefix="/users", tags=["GDPR"])


@self_router.get("/me/export", response_model=dict)
async def export_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.id == current_user.id)
        .options(
            selectinload(User.employee_profile),
            selectinload(User.client_profile).selectinload("projects"),
            selectinload(User.client_profile).selectinload("invoices"),
            selectinload(User.client_profile).selectinload("tickets"),
            selectinload(User.client_profile).selectinload("testimonials"),
            selectinload(User.notifications),
            selectinload(User.audit_logs),
        )
    )
    user = result.scalar_one()

    profile = {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "avatar": user.avatar,
        "role": user.role.value if user.role else None,
        "is_active": user.is_active,
        "is_email_verified": user.is_email_verified,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }

    employee = None
    if user.employee_profile:
        emp = user.employee_profile
        employee = {
            "employee_code": emp.employee_code,
            "department_id": str(emp.department_id) if emp.department_id else None,
            "designation": emp.designation,
            "status": emp.status.value if emp.status else None,
            "employment_type": emp.employment_type.value if emp.employment_type else None,
            "date_of_joining": emp.date_of_joining.isoformat() if emp.date_of_joining else None,
            "office_location": emp.office_location,
            "reporting_manager_id": str(emp.reporting_manager_id) if emp.reporting_manager_id else None,
        }

    client = None
    projects = None
    invoices = None
    tickets = None
    testimonials = None
    if user.client_profile:
        cli = user.client_profile
        client = {
            "company_name": cli.company_name,
            "industry": cli.industry,
            "country": cli.country,
            "website": cli.website,
        }
        if cli.projects:
            projects = [
                {
                    "id": str(p.id),
                    "title": p.title,
                    "status": p.status.value if p.status else None,
                    "start_date": p.start_date.isoformat() if p.start_date else None,
                    "end_date": p.end_date.isoformat() if p.end_date else None,
                }
                for p in cli.projects
            ]
        if cli.invoices:
            invoices = [
                {
                    "id": str(inv.id),
                    "invoice_number": inv.invoice_number,
                    "amount": float(inv.amount),
                    "total_amount": float(inv.total_amount),
                    "currency": inv.currency,
                    "status": inv.status.value if inv.status else None,
                    "issue_date": inv.issue_date.isoformat() if inv.issue_date else None,
                    "due_date": inv.due_date.isoformat() if inv.due_date else None,
                }
                for inv in cli.invoices
            ]
        if cli.tickets:
            tickets = [
                {
                    "id": str(t.id),
                    "ticket_number": t.ticket_number,
                    "subject": t.subject,
                    "priority": t.priority.value if t.priority else None,
                    "status": t.status.value if t.status else None,
                }
                for t in cli.tickets
            ]
        if cli.testimonials:
            testimonials = [
                {
                    "id": str(t.id),
                    "content": t.content if hasattr(t, "content") else None,
                }
                for t in cli.testimonials
            ]

    notifications = None
    if user.notifications:
        notifications = [
            {
                "id": str(n.id),
                "title": n.title,
                "message": n.message,
                "type": n.type.value if n.type else None,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in user.notifications
        ]

    audit_logs = None
    if user.audit_logs:
        audit_logs = [
            {
                "id": str(a.id),
                "action": a.action,
                "entity_type": a.entity_type,
                "entity_id": str(a.entity_id) if a.entity_id else None,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in user.audit_logs
        ]

    return success_response(
        data={
            "profile": profile,
            "employee_profile": employee,
            "client_profile": client,
            "projects": projects,
            "invoices": invoices,
            "tickets": tickets,
            "testimonials": testimonials,
            "notifications": notifications,
            "audit_logs": audit_logs,
        },
        message="User data exported",
    )


@self_router.delete("/me", response_model=dict)
async def anonymize_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, current_user.id)
    uuid_str = str(uuid.uuid4())
    user.name = "Deleted User"
    user.email = f"deleted-{uuid_str}@corefusiontech.com"
    user.phone = None
    user.avatar = None
    user.is_active = False
    await db.commit()
    return success_response(message="Your data has been anonymized")
