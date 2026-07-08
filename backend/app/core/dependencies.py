import uuid

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import ApiError
from app.core.security import decode_supabase_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def _resolve_user(claims: dict, db: AsyncSession) -> User | None:
    user_id = uuid.UUID(claims["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        # Auto-provision a minimal profile row for a Supabase-authenticated user
        # who has no local profile yet (e.g. signed up via OAuth or directly
        # through the Supabase dashboard).
        metadata = claims.get("user_metadata") or {}
        user = User(
            id=user_id,
            email=claims.get("email", ""),
            name=metadata.get("name") or claims.get("email", "New User"),
            role="client",
            is_active=True,
            is_email_verified=bool(
                claims.get("email_confirmed_at") or metadata.get("email_verified")
            ),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise ApiError.unauthorized("Authentication token missing")

    try:
        claims = await decode_supabase_token(credentials.credentials)
    except ValueError as exc:
        raise ApiError.unauthorized("Invalid or expired token") from exc

    user = await _resolve_user(claims, db)
    if user is None or not user.is_active:
        raise ApiError.unauthorized("User no longer exists or is deactivated")

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        claims = await decode_supabase_token(credentials.credentials)
        user = await _resolve_user(claims, db)
        return user if (user and user.is_active) else None
    except Exception:
        return None


def require_roles(*roles: str):
    """
    Usage: Depends(require_roles("admin", "hr"))
    Returns the authenticated user so endpoints can use it directly.
    "super_admin" always bypasses the role check.
    """

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "super_admin":
            return current_user
        if current_user.role not in roles:
            raise ApiError.forbidden("You do not have permission to perform this action")
        return current_user

    return dependency


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    return forwarded.split(",")[0] if forwarded else (
        request.client.host if request.client else "unknown"
    )
