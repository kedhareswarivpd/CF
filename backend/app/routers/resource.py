import uuid

from fastapi import Depends
from slugify import slugify
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.base import CRUDBase
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceOut, ResourceUpdate
from app.utils.responses import success_response
from app.utils.router_factory import build_crud_router

crud = CRUDBase(Resource, searchable_fields=["title", "description"])

router = build_crud_router(
    crud, ResourceCreate, ResourceUpdate, ResourceOut,
    prefix="/resources", tags=["Resources"],
    public_read=True, write_roles=["admin", "marketing"],
    allowed_filters=["resource_type", "is_published"],
    before_create=lambda data, user: {**data, "slug": data.get("slug") or slugify(data["title"])},
)


@router.post("/{item_id}/track", response_model=dict)
async def track_download(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    item = await crud.get(db, item_id)
    item.download_count += 1
    await db.commit()
    return success_response(data={"file_url": item.file_url})
