import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.schemas.finance import InvoiceCreate, InvoiceOut, InvoiceUpdate, PaymentCreate, PaymentOut
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/finance", tags=["Finance"], dependencies=[Depends(require_roles("admin", "finance"))])

invoice_crud = CRUDBase(Invoice, searchable_fields=["invoice_number"])


@router.get("/invoices", response_model=dict)
async def list_invoices(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {k: request.query_params.get(k) for k in ("client_id", "project_id", "status") if request.query_params.get(k)}
    items, total = await invoice_crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[InvoiceOut.model_validate(i) for i in items], message="Invoices fetched", meta=meta)


@router.get("/invoices/{invoice_id}", response_model=dict)
async def get_invoice(invoice_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    invoice = await invoice_crud.get(db, invoice_id)
    return success_response(data=InvoiceOut.model_validate(invoice))


@router.post("/invoices", response_model=dict, status_code=201)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    data["invoice_number"] = data.get("invoice_number") or f"INV-{int(datetime.utcnow().timestamp())}"
    data["total_amount"] = float(data["amount"]) + float(data.get("tax") or 0)
    invoice = await invoice_crud.create(db, data)
    return success_response(data=InvoiceOut.model_validate(invoice), message="Invoice created successfully", status_code=201)


@router.put("/invoices/{invoice_id}", response_model=dict)
async def update_invoice(invoice_id: uuid.UUID, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db)):
    invoice = await invoice_crud.update(db, invoice_id, payload.model_dump(exclude_unset=True))
    return success_response(data=InvoiceOut.model_validate(invoice), message="Invoice updated successfully")


@router.post("/invoices/{invoice_id}/payments", response_model=dict, status_code=201)
async def record_payment(invoice_id: uuid.UUID, payload: PaymentCreate, db: AsyncSession = Depends(get_db)):
    invoice = await invoice_crud.get(db, invoice_id)

    payment = Payment(**payload.model_dump(), invoice_id=invoice.id)
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    paid_total = (
        await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.invoice_id == invoice.id, Payment.status == "completed"
            )
        )
    ).scalar_one()

    if float(paid_total) >= float(invoice.total_amount):
        invoice.status = "paid"
        await db.commit()

    return success_response(data=PaymentOut.model_validate(payment), message="Payment recorded successfully", status_code=201)
