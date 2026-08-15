from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[2]

# SQLAlchemy driver aliases used to switch a `postgresql://` URL between the
# async and sync dialects. The order matters for prefixes like
# `postgresql+asyncpg://` which already contain a `+`.
_DRIVER_ALIASES = (
    ("postgresql+asyncpg://", "postgresql+psycopg2://"),
    ("postgresql+psycopg2://", "postgresql+asyncpg://"),
    ("postgresql://", "postgresql+asyncpg://"),
    ("postgresql://", "postgresql+psycopg2://"),
)


def _as_scheme(url: str, scheme: str) -> str:
    """Convert a PostgreSQL URL to the given driver scheme, leaving others untouched."""
    for old, new in _DRIVER_ALIASES:
        if new == scheme and url.startswith(old):
            return scheme + url[len(old):]
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    env: str = "development"
    app_name: str = "CoreFusion Technologies"
    api_prefix: str = "/api/v1"
    client_url: str = "http://localhost:5173"
    port: int = 8000

    # Database - can be set via DATABASE_URL or individual components
    database_url: str = ""  # Full PostgreSQL URL (takes precedence)
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "postgres"
    db_user: str = "postgres"
    db_pass: str = ""
    db_use_pgbouncer: bool = False  # set True when pointing at Supabase's transaction pooler (port 6543)

    # Supabase
    
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str | None = None

    # JWT (Supabase issues these; we only need the algorithm to verify them)
    jwt_algorithm: str = "HS256"

    # SMTP
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = "CoreFusion Technologies <no-reply@corefusiontech.com>"

    # Uploads
    upload_dir: str = "uploads"
    max_file_size_mb: int = 10

    # Site
    site_url: str = "https://www.corefusiontech.com"

    # Rate limiting
    rate_limit: str = "300/15minute"

    # Extra CORS origins (comma-separated, e.g. for Vercel preview URLs)
    extra_cors_origins: str = ""

    # Trust `x-forwarded-for` for client IP (only when behind a known proxy/load balancer)
    trust_proxy_headers: bool = False

    def _get_async_database_url(self) -> str:
        """Get the async PostgreSQL URL."""
        return _as_scheme(self.database_url, "postgresql+asyncpg://") if self.database_url else (
            f"postgresql+asyncpg://{self.db_user}:{self.db_pass}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    def _get_sync_database_url(self) -> str:
        """Get the sync PostgreSQL URL (for Alembic migrations)."""
        return _as_scheme(self.database_url, "postgresql+psycopg2://") if self.database_url else (
            f"postgresql+psycopg2://{self.db_user}:{self.db_pass}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def async_database_url(self) -> str:
        """Get the async database URL."""
        return self._get_async_database_url()

    @property
    def sync_database_url(self) -> str:
        """Get the sync database URL (used by Alembic for migrations)."""
        return self._get_sync_database_url()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
