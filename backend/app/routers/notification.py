from fastapi import APIRouter, Depends
from sqlalchemy import select, update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.ops import NotificationOut
from app.utils.responses import success_response
import uuid

router = APIRouter(prefix="/notifications", tags=["Notifications"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=dict)
async def list_notifications(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50)
    )
    return success_response(data=[NotificationOut.model_validate(n) for n in result.scalars().all()])


@router.patch("/{notification_id}/read", response_model=dict)
async def mark_read(notification_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await db.execute(
        sa_update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    await db.commit()
    return success_response(message="Marked as read")


@router.patch("/read-all", response_model=dict)
async def mark_all_read(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await db.execute(
        sa_update(Notification).where(Notification.user_id == current_user.id, Notification.is_read.is_(False)).values(is_read=True)
    )
    await db.commit()
    return success_response(message="All notifications marked as read")
