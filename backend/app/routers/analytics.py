from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.logger import logger
from app.models.analytics import PageView
from app.schemas.analytics import AnalyticsSummary, PageViewStats
from app.utils.responses import success_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])


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
