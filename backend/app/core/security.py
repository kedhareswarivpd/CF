"""
JWT verification for Supabase-issued access tokens.

Supabase signs tokens with either:
  - HS256  (legacy projects): shared secret from Project Settings → API → JWT Secret
  - ES256  (current projects): asymmetric EC key, public half published at JWKS endpoint
  - RS256  (some enterprise configs): asymmetric RSA key, same JWKS endpoint

python-jose 3.3.0 cannot accept a raw EC JWK dict directly as the `key`
argument to jwt.decode() — it fails to construct the ECKey internally for
ES256. We must explicitly build the key object first using jose.backends.ECKey
(for ES256) or jose.backends.RSAKey (for RS256).

The JWKS fetch is async to avoid blocking the event loop.
"""

import asyncio
import time
from typing import Any

import httpx
from jose import JWTError, jwt
from jose.backends import ECKey, RSAKey

from app.core.config import settings
from app.core.logger import logger

SUPABASE_AUDIENCE = "authenticated"
_JWKS_TTL_SECONDS = 3600

_jwks_cache: dict[str, Any] = {"keys": [], "fetched_at": 0.0}
_jwks_lock = asyncio.Lock()


def _jwks_url() -> str:
    return f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"


async def _fetch_jwks_async() -> list[dict]:
    """Fetch JWKS from Supabase asynchronously. Returns empty list on failure."""
    if not settings.supabase_url:
        return []
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(_jwks_url())
            response.raise_for_status()
            return response.json().get("keys", [])
    except Exception as exc:
        logger.warning("Could not fetch Supabase JWKS: %s", exc)
        return []


async def _get_jwks(force_refresh: bool = False) -> list[dict]:
    """Return cached JWKS keys, refreshing if stale or forced."""
    now = time.time()
    if (
        not force_refresh
        and _jwks_cache["keys"]
        and (now - _jwks_cache["fetched_at"]) < _JWKS_TTL_SECONDS
    ):
        return _jwks_cache["keys"]

    async with _jwks_lock:
        # Re-check inside the lock — another coroutine may have refreshed already.
        now = time.time()
        if (
            not force_refresh
            and _jwks_cache["keys"]
            and (now - _jwks_cache["fetched_at"]) < _JWKS_TTL_SECONDS
        ):
            return _jwks_cache["keys"]

        keys = await _fetch_jwks_async()
        if keys:
            _jwks_cache["keys"] = keys
            _jwks_cache["fetched_at"] = now
        # If fetch failed, keep the stale cache rather than clearing it.

    return _jwks_cache["keys"]


async def _find_jwk(kid: str) -> dict | None:
    """Find a JWK by key ID, refreshing the cache once if not found."""
    keys = await _get_jwks()
    jwk = next((k for k in keys if k.get("kid") == kid), None)
    if jwk is None:
        # Key not in cache — could be a just-rotated signing key.
        keys = await _get_jwks(force_refresh=True)
        jwk = next((k for k in keys if k.get("kid") == kid), None)
    return jwk


def _build_key(jwk: dict, alg: str):
    """
    Construct a jose key object from a JWK dict.

    python-jose 3.3.0 does NOT correctly handle raw EC JWK dicts when passed
    directly to jwt.decode() — it raises JWTError during key construction.
    We must build the key explicitly here.
    """
    kty = jwk.get("kty", "").upper()
    if kty == "EC":
        return ECKey(jwk, algorithm=alg)
    if kty == "RSA":
        return RSAKey(jwk, algorithm=alg)
    # Fallback: let jose try (works for symmetric keys passed as dicts)
    return jwk


async def decode_supabase_token(token: str) -> dict:
    """
    Verify a Supabase access token and return its claims.
    Raises ValueError on any invalid / expired / mis-signed token.
    """
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise ValueError("Invalid token format") from exc

    alg = header.get("alg", "")

    try:
        if alg == "HS256":
            if not settings.supabase_jwt_secret:
                raise ValueError("SUPABASE_JWT_SECRET is not configured")
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience=SUPABASE_AUDIENCE,
            )

        # Asymmetric: ES256 or RS256 — verify against Supabase's published public key.
        kid = header.get("kid")
        if not kid:
            raise ValueError("Token header missing 'kid' — cannot locate signing key")

        raw_jwk = await _find_jwk(kid)
        if raw_jwk is None:
            raise ValueError(f"No matching Supabase signing key for kid={kid!r}")

        key = _build_key(raw_jwk, alg)
        return jwt.decode(token, key, algorithms=[alg], audience=SUPABASE_AUDIENCE)

    except JWTError as exc:
        try:
            claims = jwt.get_unverified_claims(token)
            iss = claims.get("iss", "unknown")
        except Exception:
            iss = "unknown"
        logger.warning(
            "Token verification failed — alg=%s kid=%s iss=%s: %s",
            alg, header.get("kid"), iss, exc,
        )
        raise ValueError("Invalid or expired token") from exc
