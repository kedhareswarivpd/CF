from jose import JWTError, jwt

from app.core.config import settings

# Supabase-issued access tokens are HS256-signed with the project's JWT secret
# (Project Settings -> API -> JWT Settings in the Supabase dashboard) and carry
# the fixed audience "authenticated" for logged-in users.
SUPABASE_AUDIENCE = "authenticated"


def decode_supabase_token(token: str) -> dict:
    """
    Verifies a Supabase access token and returns its claims.
    Raises ValueError on any invalid/expired/mis-signed token.
    """
    if not settings.supabase_jwt_secret:
        raise ValueError("SUPABASE_JWT_SECRET is not configured")
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience=SUPABASE_AUDIENCE,
        )
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
