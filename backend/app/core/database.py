import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.config import settings


_original_execute = AsyncSession.execute


async def _compat_execute(self, statement, params=None, *, execution_options=None, bind_arguments=None, **kw):
    if execution_options is None:
        execution_options = {}
    else:
        execution_options = dict(execution_options)
    execution_options.setdefault("stream_results", False)
    try:
        return await _original_execute(
            self,
            statement,
            params,
            execution_options=execution_options,
            bind_arguments=bind_arguments,
            **kw,
        )
    except Exception as exc:
        from app.core.logger import logger

        logger.warning("Database execute failed: %s", exc)
        raise


AsyncSession.execute = _compat_execute

connect_args = {"statement_cache_size": 0} if settings.db_use_pgbouncer else {}

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.env == "development",
    pool_size=1,
    max_overflow=0,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)


class Base(DeclarativeBase):
    """Base class for all ORM models — adds a UUID PK and timestamps to everything."""

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
