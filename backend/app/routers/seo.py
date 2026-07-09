from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.seo import SeoMetadata
from app.schemas.seo import SeoMetadataCreate, SeoMetadataOut, SeoMetadataUpdate
from app.utils.responses import success_response

router = APIRouter(prefix="/seo", tags=["SEO"])

crud = CRUDBase(SeoMetadata)


@router.get("/{page_path:path}", response_model=dict)
async def get_seo(page_path: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(SeoMetadata).where(SeoMetadata.page_path == page_path))
        seo = result.scalar_one_or_none()
        if not seo:
            return success_response(data=None, message="No SEO metadata for this path")
        return success_response(data=SeoMetadataOut.model_validate(seo))
    except Exception as e:
        logger.exception(f"Failed to get SEO metadata: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get SEO metadata: {str(e)}"
        )


@router.put("/{page_path:path}", response_model=dict, dependencies=[Depends(require_roles("admin", "marketing"))])
async def upsert_seo(page_path: str, payload: SeoMetadataUpdate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(SeoMetadata).where(SeoMetadata.page_path == page_path))
        seo = result.scalar_one_or_none()
        if seo:
            for field, value in payload.model_dump(exclude_unset=True).items():
                setattr(seo, field, value)
        else:
            seo = SeoMetadata(page_path=page_path, **payload.model_dump(exclude_unset=True))
            db.add(seo)
        await db.commit()
        await db.refresh(seo)
        return success_response(data=SeoMetadataOut.model_validate(seo), message="SEO metadata saved")
    except Exception as e:
        logger.exception(f"Failed to upsert SEO metadata: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upsert SEO metadata: {str(e)}"
        )


@router.delete("/{page_path:path}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_seo(page_path: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(SeoMetadata).where(SeoMetadata.page_path == page_path))
        seo = result.scalar_one_or_none()
        if seo:
            await db.delete(seo)
            await db.commit()
        return success_response(message="SEO metadata deleted")
    except Exception as e:
        logger.exception(f"Failed to delete SEO metadata: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete SEO metadata: {str(e)}"
        )
