import uuid
from typing import Any, Callable

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.crud.base import CRUDBase
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response


def build_crud_router(
    crud: CRUDBase,
    create_schema,
    update_schema,
    out_schema,
    *,
    prefix: str,
    tags: list[str],
    public_read: bool = False,
    write_roles: list[str] = ("admin",),
    allowed_filters: list[str] | None = None,
    before_create: Callable[[dict, Any], dict] | None = None,
) -> APIRouter:
    """
    Generates GET / , GET /{id}, POST /, PUT /{id}, DELETE /{id} for a resource.
    `allowed_filters` are read straight off the querystring (e.g. ?status=open)
    so callers don't need a fixed function signature per resource.
    `before_create` optionally receives (payload_dict, current_user) and returns
    an augmented payload (e.g. to inject a slug or an author_id).
    """
    router = APIRouter(prefix=prefix, tags=tags)
    allowed_filters = allowed_filters or []
    read_dep = [] if public_read else [Depends(get_current_user)]

    @router.get("", dependencies=read_dep, response_model=dict)
    async def list_items(
        request: Request,
        db: AsyncSession = Depends(get_db),
        page: PageParams = Depends(page_params),
    ):
        filters = {f: request.query_params.get(f) for f in allowed_filters if request.query_params.get(f)}
        items, total = await crud.list(db, page, filters)
        data = [out_schema.model_validate(i) for i in items]
        meta = build_pagination_meta(total, page.page, page.limit)
        return success_response(data=data, message=f"{crud.model.__name__} list fetched", meta=meta)

    @router.get("/{item_id}", dependencies=read_dep, response_model=dict)
    async def get_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
        obj = await crud.get(db, item_id)
        return success_response(data=out_schema.model_validate(obj))

    @router.post("", dependencies=[Depends(require_roles(*write_roles))], response_model=dict, status_code=201)
    async def create_item(
        payload: create_schema,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
    ):
        data = payload.model_dump()
        if before_create:
            data = before_create(data, current_user)
        obj = await crud.create(db, data)
        return success_response(
            data=out_schema.model_validate(obj), message=f"{crud.model.__name__} created successfully", status_code=201
        )

    @router.put("/{item_id}", dependencies=[Depends(require_roles(*write_roles))], response_model=dict)
    async def update_item(item_id: uuid.UUID, payload: update_schema, db: AsyncSession = Depends(get_db)):
        obj = await crud.update(db, item_id, payload.model_dump(exclude_unset=True))
        return success_response(data=out_schema.model_validate(obj), message=f"{crud.model.__name__} updated successfully")

    @router.delete("/{item_id}", dependencies=[Depends(require_roles(*write_roles))], response_model=dict)
    async def delete_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
        await crud.delete(db, item_id)
        return success_response(message=f"{crud.model.__name__} deleted successfully")

    return router
