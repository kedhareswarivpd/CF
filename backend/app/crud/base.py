import uuid
from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ApiError
from app.core.logger import logger
from app.utils.pagination import PageParams, apply_sort

ModelType = TypeVar("ModelType")


class CRUDBase(Generic[ModelType]):
    """
    Generic async CRUD operations for a SQLAlchemy model.
    Mirrors the Node.js `crudFactory` utility — keeps simple CMS resources
    (Category, Service, Industry, Technology, Testimonials, Partners, Awards,
    FAQs, Gallery, Downloads, Events, etc.) consistent and boilerplate-free.
    """

    def __init__(self, model: type[ModelType], searchable_fields: list[str] | None = None, relationships: list[str] | None = None):
        self.model = model
        self.searchable_fields = searchable_fields or []
        self.relationships = relationships or []

    def _with_relationships(self, query):
        for rel in self.relationships:
            query = query.options(selectinload(getattr(self.model, rel)))
        return query

    async def list(
        self, db: AsyncSession, page_params: PageParams, filters: dict[str, Any] | None = None
    ) -> tuple[Sequence[ModelType], int]:
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        conditions = []
        for field, value in (filters or {}).items():
            if value is None:
                continue
            column = getattr(self.model, field, None)
            if column is not None:
                conditions.append(column == value)

        if page_params.search and self.searchable_fields:
            search_conditions = [
                getattr(self.model, f).ilike(f"%{page_params.search}%")
                for f in self.searchable_fields
                if hasattr(self.model, f)
            ]
            if search_conditions:
                conditions.append(or_(*search_conditions))

        for cond in conditions:
            query = query.where(cond)
            count_query = count_query.where(cond)

        query = self._with_relationships(query)
        query = apply_sort(query, self.model, page_params.sort)
        query = query.limit(page_params.limit).offset(page_params.offset)

        try:
            result = await db.execute(query)
            total = (await db.execute(count_query)).scalar_one()
        except Exception as exc:
            logger.warning("Database query failed for %s list; returning empty results: %s", self.model.__name__, exc)
            return [], 0

        return result.scalars().unique().all(), total

    async def get(self, db: AsyncSession, id: uuid.UUID) -> ModelType:
        query = self._with_relationships(select(self.model).where(self.model.id == id))
        try:
            result = await db.execute(query)
        except Exception as exc:
            logger.warning("Database query failed for %s get; raising not found: %s", self.model.__name__, exc)
            raise ApiError.not_found(f"{self.model.__name__} not found") from exc

        obj = result.scalar_one_or_none()
        if obj is None:
            raise ApiError.not_found(f"{self.model.__name__} not found")
        return obj

    async def get_optional(self, db: AsyncSession, **kwargs) -> ModelType | None:
        query = select(self.model)
        for field, value in kwargs.items():
            query = query.where(getattr(self.model, field) == value)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: dict[str, Any]) -> ModelType:
        try:
            obj = self.model(**data)
            db.add(obj)
            await db.commit()
            await db.refresh(obj)
            return obj
        except Exception as e:
            await db.rollback()
            logger.exception("Database create failed for %s: %s", self.model.__name__, e)
            raise ApiError.internal(f"Failed to create {self.model.__name__}: {str(e)}")

    _UNSET = object()

    async def update(self, db: AsyncSession, id: uuid.UUID, data: dict[str, Any]) -> ModelType:
        obj = await self.get(db, id)
        for field, value in data.items():
            if value is not self._UNSET:
                setattr(obj, field, value)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def delete(self, db: AsyncSession, id: uuid.UUID) -> None:
        try:
            obj = await self.get(db, id)
            await db.delete(obj)
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.exception("Database delete failed for %s: %s", self.model.__name__, e)
            raise ApiError.internal(f"Failed to delete {self.model.__name__}: {str(e)}")
