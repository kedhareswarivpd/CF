import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.pool import NullPool

from app.core.config import settings


if settings.db_use_pgbouncer:
    # PgBouncer's transaction pooling can hand out the same backend connection to
    # different sessions between statements, so asyncpg's default sequential
    # statement names (__asyncpg_stmt_1__, ...) collide across sessions. Use
    # per-statement unique names and skip SQLAlchemy-level pooling since PgBouncer
    # already pools for us — see SQLAlchemy asyncpg docs, "Prepared Statement Name
    # with PGBouncer".
    engine = create_async_engine(
        settings.async_database_url,
        echo=settings.env == "development",
        poolclass=NullPool,
        connect_args={
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
            "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
        },
    )
else:
    engine = create_async_engine(
        settings.async_database_url,
        echo=settings.env == "development",
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
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
