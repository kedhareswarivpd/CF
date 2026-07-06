import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.base import CRUDBase
from app.models.download import Download
from app.schemas.cms import DownloadCreate, DownloadOut, DownloadUpdate
from app.utils.responses import success_response
from app.utils.router_factory import build_crud_router

crud = CRUDBase(Download, searchable_fields=["title", "category"])

router = build_crud_router(
    crud, DownloadCreate, DownloadUpdate, DownloadOut,
    prefix="/downloads", tags=["Downloads"],
    public_read=True, write_roles=["admin", "marketing"],
    allowed_filters=["category", "is_published"],
)


@router.post("/{item_id}/track", response_model=dict)
async def track_download(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    item = await crud.get(db, item_id)
    item.download_count += 1
    await db.commit()
    return success_response(data={"file_url": item.file_url})
