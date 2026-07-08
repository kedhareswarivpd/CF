import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.enums import LeadStatus, NotificationType, ProposalStatus
from app.models.lead import Lead
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.crm import ProposalCreate, ProposalOut, ProposalUpdate
from app.services.notification_service import notify_roles
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/proposals", tags=["CRM — Proposals"], dependencies=[Depends(require_roles("sales", "admin"))])

crud = CRUDBase(Proposal, searchable_fields=["scope_summary"])
lead_crud = CRUDBase(Lead)

# Proposals priced above this value need a Finance/Admin discount-threshold sign-off before sending.
DISCOUNT_APPROVAL_THRESHOLD = 50_000


@router.get("", response_model=dict)
async def list_proposals(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("status", "lead_id") if request.query_params.get(k)}
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[ProposalOut.model_validate(p) for p in items], message="Proposals fetched", meta=meta)


@router.get("/{proposal_id}", response_model=dict)
async def get_proposal(proposal_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    proposal = await crud.get(db, proposal_id)
    return success_response(data=ProposalOut.model_validate(proposal))


@router.post("", response_model=dict, status_code=201)
async def create_proposal(payload: ProposalCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    proposal = await crud.create(db, {**payload.model_dump(), "created_by": current_user.id})
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal drafted", status_code=201)


@router.patch("/{proposal_id}", response_model=dict)
async def update_proposal(proposal_id: uuid.UUID, payload: ProposalUpdate, db: AsyncSession = Depends(get_db)):
    proposal = await crud.update(db, proposal_id, payload.model_dump(exclude_unset=True))
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal updated")


@router.post("/{proposal_id}/send", response_model=dict)
async def send_proposal(proposal_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    proposal = await crud.get(db, proposal_id)
    if proposal.status != ProposalStatus.draft:
        raise ApiError.bad_request("Only a draft proposal can be sent")

    proposal = await crud.update(db, proposal_id, {"status": ProposalStatus.sent, "sent_at": datetime.now(timezone.utc)})
    await lead_crud.update(db, proposal.lead_id, {"status": LeadStatus.proposal_sent})

    if float(proposal.price) > DISCOUNT_APPROVAL_THRESHOLD:
        await notify_roles(
            db, ["finance", "admin"], "Proposal above discount threshold",
            f"Proposal {proposal.id} for {proposal.price} {proposal.currency} was sent and exceeds the standard discount threshold — review pricing.",
            NotificationType.warning, f"/admin-panel?tab=projects&proposal={proposal.id}",
        )
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal sent")


@router.post("/{proposal_id}/accept", response_model=dict)
async def accept_proposal(proposal_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    proposal = await crud.get(db, proposal_id)
    if proposal.status not in (ProposalStatus.sent, ProposalStatus.viewed):
        raise ApiError.bad_request("Only a sent proposal can be accepted")

    proposal = await crud.update(db, proposal_id, {"status": ProposalStatus.accepted})
    await lead_crud.update(db, proposal.lead_id, {"status": LeadStatus.proposal_approved})
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal accepted")


@router.post("/{proposal_id}/reject", response_model=dict)
async def reject_proposal(proposal_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    proposal = await crud.get(db, proposal_id)
    if proposal.status not in (ProposalStatus.sent, ProposalStatus.viewed):
        raise ApiError.bad_request("Only a sent proposal can be rejected")

    proposal = await crud.update(db, proposal_id, {"status": ProposalStatus.rejected})
    return success_response(data=ProposalOut.model_validate(proposal), message="Proposal rejected")
