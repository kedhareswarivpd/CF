import uuid
from datetime import date, datetime

from pydantic import BaseModel

from app.models.enums import InvoiceStatus, PaymentMethod, PaymentStatus
from app.schemas.common import TimestampedRead


class InvoiceCreate(BaseModel):
    invoice_number: str | None = None
    client_id: uuid.UUID
    project_id: uuid.UUID | None = None
    amount: float
    tax: float = 0
    currency: str = "INR"
    issue_date: date
    due_date: date
    notes: str | None = None


class InvoiceUpdate(BaseModel):
    status: InvoiceStatus | None = None
    notes: str | None = None
    due_date: date | None = None


class InvoiceOut(TimestampedRead):
    invoice_number: str
    client_id: uuid.UUID
    project_id: uuid.UUID | None = None
    amount: float
    tax: float
    total_amount: float
    currency: str
    issue_date: date
    due_date: date
    status: InvoiceStatus
    notes: str | None = None


class PaymentCreate(BaseModel):
    amount: float
    method: PaymentMethod
    transaction_ref: str | None = None
    paid_at: datetime
    status: PaymentStatus = PaymentStatus.completed


class PaymentOut(TimestampedRead):
    invoice_id: uuid.UUID
    amount: float
    method: PaymentMethod
    transaction_ref: str | None = None
    paid_at: datetime
    status: PaymentStatus
