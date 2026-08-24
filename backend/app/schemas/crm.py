"""Schemas for the Sales CRM pipeline: Lead -> Proposal -> Contract."""
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import ContractStatus, LeadSource, LeadStatus, ProposalStatus
from app.schemas.common import TimestampedRead


# ---------- Lead ----------
class LeadCreate(BaseModel):
    company: str | None = None
    contact_name: str
    email: EmailStr
    phone: str | None = None
    source: LeadSource = LeadSource.other
    estimated_value: float | None = Field(None, ge=0)
    notes: str | None = None
    contact_submission_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None


class LeadUpdate(BaseModel):
    company: str | None = None
    contact_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    source: LeadSource | None = None
    status: LeadStatus | None = None
    estimated_value: float | None = Field(None, ge=0)
    notes: str | None = None
    owner_id: uuid.UUID | None = None


class LeadOut(TimestampedRead):
    contact_submission_id: uuid.UUID | None = None
    company: str | None = None
    contact_name: str
    email: str
    phone: str | None = None
    source: LeadSource
    status: LeadStatus
    estimated_value: float | None = None
    notes: str | None = None
    owner_id: uuid.UUID | None = None
    converted_client_id: uuid.UUID | None = None


# ---------- Proposal ----------
class ProposalCreate(BaseModel):
    lead_id: uuid.UUID
    scope_summary: str
    price: float = Field(gt=0)
    currency: str = "USD"
    file_url: str | None = None


class ProposalUpdate(BaseModel):
    scope_summary: str | None = None
    price: float | None = Field(None, gt=0)
    currency: str | None = None
    file_url: str | None = None
    status: ProposalStatus | None = None


class ProposalOut(TimestampedRead):
    lead_id: uuid.UUID
    version: int
    scope_summary: str
    price: float
    currency: str
    status: ProposalStatus
    file_url: str | None = None
    sent_at: datetime | None = None
    viewed_at: datetime | None = None
    created_by: uuid.UUID | None = None
    client_comment: str | None = None
    rejection_reason: str | None = None


class ProposalRejectRequest(BaseModel):
    reason: str | None = None


# ---------- Contract ----------
class ContractCreate(BaseModel):
    proposal_id: uuid.UUID
    document_url: str | None = None


class ContractSign(BaseModel):
    client_signed: bool = True
    company_signed: bool = True
    provision_client_account: bool = True


class ContractOut(TimestampedRead):
    proposal_id: uuid.UUID
    document_url: str | None = None
    status: ContractStatus
    signed_by_client_at: datetime | None = None
    signed_by_company_at: datetime | None = None
