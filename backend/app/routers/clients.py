import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.client import Client
from app.models.client_file import ClientFile
from app.models.client_report import ClientReport
from app.models.employee import Employee
from app.models.enums import NotificationType, ProposalStatus
from app.models.invoice import Invoice
from app.models.lead import Lead
from app.models.meeting import Meeting
from app.models.payment import Payment
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.client import ClientCreate, ClientOut, TicketCreate
from app.schemas.crm import ProposalOut, ProposalRejectRequest
from app.schemas.finance import (
    ClientFileCreate,
    ClientFileOut,
    ClientPaymentOut,
    ClientReportCreate,
    ClientReportOut,
    InvoiceOut,
)
from app.schemas.ops import MeetingOut, TicketOut
from app.schemas.project import ProjectOut
from app.services.notification_service import notify_roles
from app.utils.pagination import PageParams, bounded_select, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/clients", tags=["Clients"], dependencies=[Depends(get_current_user)])

crud = CRUDBase(Client, searchable_fields=["company_name", "country"])


async def _get_client_for_user(db: AsyncSession, user: User) -> Client:
    client = (await db.execute(select(Client).where(Client.user_id == user.id))).scalar_one_or_none()
    if not client:
        client = Client(user_id=user.id, company_name=user.name)
        db.add(client)
        await db.commit()
        await db.refresh(client)
    return client


async def _require_assigned_account_manager(db: AsyncSession, current_user: User, client: Client) -> None:
    """A role check alone (admin/project_manager/finance) isn't ownership —
    without this, any staff member with the right role could attach a
    file/report to any client, not just the ones they're actually assigned
    to manage (a real IDOR-adjacent gap found during a documentation
    review, not caught by the existing RBAC matrix since that only tests
    role gating, not per-resource ownership). admin/super_admin bypass,
    matching require_roles()'s own bypass convention elsewhere."""
    if current_user.role in ("admin", "super_admin"):
        return
    employee = (await db.execute(select(Employee).where(Employee.user_id == current_user.id))).scalar_one_or_none()
    if employee is None or client.account_manager_id != employee.id:
        raise ApiError.forbidden("You are not the assigned account manager for this client")


# ---------- Client self-service (Client Portal) ----------
@router.get("/me/profile", response_model=dict)
async def my_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    client_data = ClientOut.model_validate(client).model_dump()
    client_data["contact_name"] = current_user.name
    client_data["email"] = current_user.email
    return success_response(data=client_data)


@router.get("/me/projects", response_model=dict)
async def my_projects(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    # ProjectOut serializes `team` — must be eager-loaded or Pydantic's lazy
    # attribute access crashes with MissingGreenlet on any project that has
    # team members assigned (found via tests/e2e_workflows.py against a real
    # Postgres session; mocked tests can't reproduce this).
    result = await db.execute(
        bounded_select(
            select(Project).options(selectinload(Project.team))
            .where(Project.client_id == client.id).order_by(Project.created_at.desc())
        )
    )
    return success_response(data=[ProjectOut.model_validate(p) for p in result.scalars().unique().all()])


@router.get("/me/invoices", response_model=dict)
async def my_invoices(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(
        bounded_select(select(Invoice).where(Invoice.client_id == client.id).order_by(Invoice.issue_date.desc()))
    )
    return success_response(data=[InvoiceOut.model_validate(i) for i in result.scalars().all()])


@router.get("/me/tickets", response_model=dict)
async def my_tickets(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(bounded_select(select(Ticket).where(Ticket.client_id == client.id).order_by(Ticket.created_at.desc())))
    return success_response(data=[TicketOut.model_validate(t) for t in result.scalars().all()])


@router.post("/me/tickets", response_model=dict, status_code=201)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    ticket_number = f"TCK-{int(datetime.utcnow().timestamp())}"
    ticket = Ticket(**payload.model_dump(), client_id=client.id, ticket_number=ticket_number)
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return success_response(data=TicketOut.model_validate(ticket), message="Support ticket created", status_code=201)


# Workflow doc §7 requires the client to review and Accept/Reject a proposal
# themselves from the Client Portal — previously /proposals/{id}/accept and
# /reject were staff-only (require_roles("sales","admin","project_manager",
# "marketing")), so a client could never do this step at all. A Proposal has
# no direct client_id (it belongs to the Lead that preceded client
# conversion — see app/models/proposal.py), so ownership here is: the
# proposal's lead must have converted to *this* logged-in client.
@router.get("/me/proposals", response_model=dict)
async def my_proposals(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(
        bounded_select(
            select(Proposal).join(Lead, Proposal.lead_id == Lead.id)
            .where(Lead.converted_client_id == client.id).order_by(Proposal.created_at.desc())
        )
    )
    return success_response(data=[ProposalOut.model_validate(p) for p in result.scalars().all()])


async def _get_own_sent_proposal(db: AsyncSession, client: Client, proposal_id: uuid.UUID) -> Proposal:
    proposal = (
        await db.execute(
            select(Proposal).join(Lead, Proposal.lead_id == Lead.id)
            .where(Proposal.id == proposal_id, Lead.converted_client_id == client.id)
        )
    ).scalar_one_or_none()
    if proposal is None:
        # 404, not 403 — don't confirm to a client that a proposal ID exists
        # but belongs to someone else.
        raise ApiError.not_found("Proposal not found")
    if proposal.status != ProposalStatus.sent:
        raise ApiError.bad_request("Only a sent proposal can be accepted or rejected")
    return proposal


@router.post("/me/proposals/{proposal_id}/accept", response_model=dict)
async def accept_my_proposal(proposal_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    proposal = await _get_own_sent_proposal(db, client, proposal_id)
    proposal.status = ProposalStatus.accepted
    await db.commit()
    await db.refresh(proposal)
    await notify_roles(
        db, ["admin", "project_manager"], "Proposal accepted",
        f"{client.company_name or current_user.name} accepted proposal v{proposal.version} — ready to start the project.",
        NotificationType.success, f"/employee-portal?tab=proposals&proposal={proposal.id}",
    )
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal accepted")


@router.post("/me/proposals/{proposal_id}/reject", response_model=dict)
async def reject_my_proposal(
    proposal_id: uuid.UUID, payload: ProposalRejectRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    client = await _get_client_for_user(db, current_user)
    proposal = await _get_own_sent_proposal(db, client, proposal_id)
    proposal.status = ProposalStatus.rejected
    proposal.rejection_reason = payload.reason
    await db.commit()
    await db.refresh(proposal)
    reason_note = f" Reason: {payload.reason}" if payload.reason else ""
    await notify_roles(
        db, ["admin", "project_manager"], "Proposal rejected",
        f"{client.company_name or current_user.name} rejected proposal v{proposal.version}.{reason_note}",
        NotificationType.warning, f"/employee-portal?tab=proposals&proposal={proposal.id}",
    )
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal rejected")


@router.get("/me/payments", response_model=dict)
async def my_payments(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(
        bounded_select(
            select(Payment, Invoice.invoice_number)
            .join(Invoice, Payment.invoice_id == Invoice.id)
            .where(Invoice.client_id == client.id)
            .order_by(Payment.paid_at.desc())
        )
    )
    rows = result.all()
    out = []
    for payment, invoice_number in rows:
        item = ClientPaymentOut.model_validate(payment)
        item.invoice_number = invoice_number
        out.append(item)
    return success_response(data=out)


@router.get("/me/meetings", response_model=dict)
async def my_meetings(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    # Eager-load the organizer in the same query instead of one extra
    # per-meeting lookup (CF-AUD-011 N+1).
    result = await db.execute(
        bounded_select(
            select(Meeting)
            .options(selectinload(Meeting.organizer))
            .where(Meeting.client_id == client.id)
            .order_by(Meeting.scheduled_at.desc())
        )
    )
    meetings = result.scalars().all()
    data = []
    for m in meetings:
        meeting = MeetingOut.model_validate(m).model_dump()
        meeting["attendees"] = [m.organizer.name] if m.organizer else []
        data.append(meeting)
    return success_response(data=data)


@router.get("/me/files", response_model=dict)
async def my_files(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(
        bounded_select(select(ClientFile).where(ClientFile.client_id == client.id).order_by(ClientFile.created_at.desc()))
    )
    return success_response(data=[ClientFileOut.model_validate(f) for f in result.scalars().all()])


@router.post("/me/files", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "project_manager"))])
async def upload_client_file(client_id: uuid.UUID, payload: ClientFileCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await crud.get(db, client_id)
    await _require_assigned_account_manager(db, current_user, client)
    f = ClientFile(**payload.model_dump(), client_id=client_id)
    db.add(f)
    await db.commit()
    await db.refresh(f)
    return success_response(data=ClientFileOut.model_validate(f), message="File uploaded", status_code=201)


@router.get("/me/reports", response_model=dict)
async def my_reports(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await _get_client_for_user(db, current_user)
    result = await db.execute(
        bounded_select(select(ClientReport).where(ClientReport.client_id == client.id).order_by(ClientReport.created_at.desc()))
    )
    return success_response(data=[ClientReportOut.model_validate(r) for r in result.scalars().all()])


@router.post("/me/reports", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "finance"))])
async def create_client_report(client_id: uuid.UUID, payload: ClientReportCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = await crud.get(db, client_id)
    await _require_assigned_account_manager(db, current_user, client)
    r = ClientReport(**payload.model_dump(), client_id=client_id)
    db.add(r)
    await db.commit()
    await db.refresh(r)
    return success_response(data=ClientReportOut.model_validate(r), message="Report created", status_code=201)


# ---------- Admin / Sales management ----------
@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin", "sales", "project_manager", "finance"))])
async def list_clients(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {}
    if industry := request.query_params.get("industry"):
        filters["industry"] = industry
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ClientOut.model_validate(c) for c in items], message="Clients fetched", meta=meta)


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("admin", "sales"))])
async def create_client(payload: ClientCreate, db: AsyncSession = Depends(get_db)):
    client = await crud.create(db, payload.model_dump())
    return success_response(data=ClientOut.model_validate(client), message="Client created successfully", status_code=201)
