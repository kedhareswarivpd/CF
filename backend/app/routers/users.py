import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.supabase_client import get_admin_client
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(require_roles("admin", "hr"))])

self_router = APIRouter(prefix="/users", tags=["Users"])

crud = CRUDBase(User, searchable_fields=["name", "email"])


@router.get("", response_model=dict)
async def list_users(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params)):
    filters = {}
    if role := request.query_params.get("role"):
        filters["role"] = role
    if is_active := request.query_params.get("is_active"):
        filters["is_active"] = is_active.lower() == "true"
    items, total = await crud.list(db, page, filters)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=[UserOut.model_validate(u) for u in items], message="Users fetched", meta=meta)


@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    user = await crud.get(db, user_id)
    return success_response(data=UserOut.model_validate(user))


@router.post("", response_model=dict, status_code=201)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Creates both the Supabase auth account (via the admin API) and the local profile row.

    Only a Super Admin may grant `admin`/`super_admin` — an Admin or HR caller
    (both allowed through this router by `require_roles`) can provision every
    other role but cannot mint another admin account for themselves or anyone else.
    """
    if payload.role in ("admin", "super_admin") and current_user.role != "super_admin":
        raise ApiError.forbidden("Only a Super Admin can create an Admin or Super Admin account")

    admin = get_admin_client()
    try:
        auth_response = await run_in_threadpool(
            admin.auth.admin.create_user,
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {"name": payload.name},
            },
        )
    except Exception as exc:  # noqa: BLE001
        raise ApiError.bad_request(f"Could not create Supabase auth account: {exc}") from exc

    data = payload.model_dump(exclude={"password"})
    data["id"] = uuid.UUID(auth_response.user.id)
    data["is_email_verified"] = True
    user = await crud.create(db, data)
    return success_response(data=UserOut.model_validate(user), message="User created successfully", status_code=201)


@router.put("/{user_id}", response_model=dict)
async def update_user(user_id: uuid.UUID, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await crud.update(db, user_id, payload.model_dump(exclude_unset=True))
    return success_response(data=UserOut.model_validate(user), message="User updated successfully")


@router.patch("/{user_id}/deactivate", response_model=dict)
async def deactivate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Deactivates the profile and bans the Supabase auth account so the person can no longer log in."""
    user = await crud.update(db, user_id, {"is_active": False})
    admin = get_admin_client()
    try:
        await run_in_threadpool(admin.auth.admin.update_user_by_id, str(user_id), {"ban_duration": "876000h"})
    except Exception:  # noqa: BLE001 — profile deactivation already succeeded; don't fail the request over this
        pass
    return success_response(data=UserOut.model_validate(user), message="User deactivated")


@router.delete("/{user_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    admin = get_admin_client()
    try:
        await run_in_threadpool(admin.auth.admin.delete_user, str(user_id))
    except Exception:  # noqa: BLE001 — proceed to remove the local profile even if Supabase deletion fails
        pass
    await crud.delete(db, user_id)
    return success_response(message="User deleted successfully")



