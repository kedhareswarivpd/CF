from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.newsletter import NewsletterSubscriber
from app.schemas.newsletter import NewsletterOut, NewsletterSubscribe
from app.utils.responses import success_response

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

crud = CRUDBase(NewsletterSubscriber, searchable_fields=["email", "name"])


@router.post("/subscribe", response_model=dict, status_code=201)
async def subscribe(payload: NewsletterSubscribe, db: AsyncSession = Depends(get_db)):
    existing = await crud.get_optional(db, email=payload.email)
    if existing:
        if not existing.is_active:
            existing.is_active = True
            existing.unsubscribed_at = None
            await db.commit()
            return success_response(message="Subscription reactivated")
        raise ApiError.conflict("This email is already subscribed")

    subscriber = NewsletterSubscriber(email=payload.email, name=payload.name)
    db.add(subscriber)
    await db.commit()
    return success_response(message="Subscribed successfully", status_code=201)


@router.post("/unsubscribe", response_model=dict)
async def unsubscribe(email: str, db: AsyncSession = Depends(get_db)):
    subscriber = await crud.get_optional(db, email=email)
    if not subscriber:
        raise ApiError.not_found("Email not found in our subscribers")

    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.now(timezone.utc)
    await db.commit()
    return success_response(message="Unsubscribed successfully")


@router.get("/subscribers", response_model=dict, dependencies=[Depends(require_roles("admin", "marketing"))])
async def list_subscribers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.is_active == True).order_by(NewsletterSubscriber.subscribed_at.desc()))
    return success_response(data=[NewsletterOut.model_validate(s) for s in result.scalars().all()], message="Subscribers fetched")
