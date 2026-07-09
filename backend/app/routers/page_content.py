from fastapi import APIRouter, Depends, HTTPException
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.page_content import PageContent
from app.schemas.page_content import PageContentCreate, PageContentOut, PageContentUpdate
from app.utils.responses import success_response

router = APIRouter(prefix="/pages", tags=["Page Content"])

crud = CRUDBase(PageContent)


@router.get("/{slug}", response_model=dict)
async def get_page(slug: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(PageContent).where(PageContent.slug == slug))
        page = result.scalar_one_or_none()
        if not page:
            raise ApiError.not_found("Page not found")
        return success_response(data=PageContentOut.model_validate(page))
    except ApiError:
        raise
    except Exception as e:
        logger.exception(f"Failed to get page: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get page: {str(e)}"
        )


@router.put("/{slug}", response_model=dict, dependencies=[Depends(require_roles("admin", "marketing"))])
async def upsert_page(slug: str, payload: PageContentUpdate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(PageContent).where(PageContent.slug == slug))
        page = result.scalar_one_or_none()
        if page:
            for field, value in payload.model_dump(exclude_unset=True).items():
                setattr(page, field, value)
        else:
            page = PageContent(slug=slug, **payload.model_dump(exclude_unset=True))
            db.add(page)
        await db.commit()
        await db.refresh(page)
        return success_response(data=PageContentOut.model_validate(page), message="Page saved")
    except Exception as e:
        logger.exception(f"Failed to upsert page: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upsert page: {str(e)}"
        )


@router.delete("/{slug}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_page(slug: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(PageContent).where(PageContent.slug == slug))
        page = result.scalar_one_or_none()
        if page:
            await db.delete(page)
            await db.commit()
        return success_response(message="Page deleted")
    except Exception as e:
        logger.exception(f"Failed to delete page: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete page: {str(e)}"
        )
