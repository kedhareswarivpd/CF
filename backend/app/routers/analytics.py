from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.models.analytics import PageView
from app.schemas.analytics import AnalyticsSummary, PageViewCreate, PageViewStats
from app.utils.responses import success_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/track", response_model=dict)
async def track_page_view(payload: PageViewCreate, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        if not payload.path or not payload.path.strip():
            raise HTTPException(
                status_code=400,
                detail="Path is required and cannot be empty"
            )
        
        view = PageView(
            path=payload.path,
            ip_address=payload.ip_address or request.headers.get("x-forwarded-for", request.client.host if request.client else None),
            user_agent=payload.user_agent or request.headers.get("user-agent"),
            referrer=payload.referrer or request.headers.get("referer"),
            country=payload.country,
        )
        db.add(view)
        await db.commit()
        return success_response(message="Page view tracked")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to track page view: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to track page view: {str(e)}"
        )


@router.get("/summary", response_model=dict, dependencies=[Depends(require_roles("admin", "marketing"))])
async def analytics_summary(db: AsyncSession = Depends(get_db)):
    try:
        total_views = (await db.execute(select(func.count(PageView.id)))).scalar_one()
        unique_paths = (await db.execute(select(func.count(func.distinct(PageView.path))))).scalar_one()
        top_pages_result = await db.execute(
            select(PageView.path, func.count(PageView.id).label("count"))
            .group_by(PageView.path)
            .order_by(func.count(PageView.id).desc())
            .limit(20)
        )
        top_pages = [PageViewStats(path=row.path, count=row.count) for row in top_pages_result.all()]

        stats = AnalyticsSummary(total_views=total_views, unique_paths=unique_paths, top_pages=top_pages)
        return success_response(data=stats, message="Analytics summary fetched")
    except Exception as e:
        logger.exception(f"Failed to fetch analytics summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch analytics summary: {str(e)}"
        )
