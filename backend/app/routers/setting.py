from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.setting import Setting
from app.schemas.ops import SettingOut, SettingUpsert
from app.utils.responses import success_response

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/public", response_model=dict)
async def public_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting).where(Setting.group == "public"))
    return success_response(data=[SettingOut.model_validate(s) for s in result.scalars().all()])


@router.get("", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def list_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting))
    return success_response(data=[SettingOut.model_validate(s) for s in result.scalars().all()])


@router.put("/{key}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def upsert_setting(key: str, payload: SettingUpsert, db: AsyncSession = Depends(get_db)):
    stmt = (
        insert(Setting)
        .values(key=key, value=payload.value, group=payload.group)
        .on_conflict_do_update(index_elements=["key"], set_={"value": payload.value, "group": payload.group})
        .returning(Setting)
    )
    result = await db.execute(stmt)
    await db.commit()
    setting = result.scalar_one()
    return success_response(data=SettingOut.model_validate(setting), message="Setting updated")
