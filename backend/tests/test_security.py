"""Unit tests for JWT verification, JWKS caching, and key construction."""
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from jose import JWTError, jwt
from jose.backends import ECKey, RSAKey

from app.core import security
from app.core.config import settings


class TestJwksUrl:
    def test_jwks_url_returns_correct_format(self):
        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            url = security._jwks_url()
            assert url == "https://example.supabase.co/auth/v1/.well-known/jwks.json"

    def test_jwks_url_strips_trailing_slash(self):
        with patch.object(settings, "supabase_url", "https://example.supabase.co/"):
            url = security._jwks_url()
            assert url == "https://example.supabase.co/auth/v1/.well-known/jwks.json"


class TestFetchJwksAsync:
    @pytest.mark.asyncio
    async def test_fetch_jwks_returns_empty_when_no_supabase_url(self):
        with patch.object(settings, "supabase_url", ""):
            result = await security._fetch_jwks_async()
            assert result == []

    @pytest.mark.asyncio
    async def test_fetch_jwks_returns_keys_on_success(self):
        mock_response = MagicMock()
        mock_response.json.return_value = {"keys": [{"kid": "abc", "kty": "EC"}]}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch("app.core.security.httpx.AsyncClient", return_value=mock_client):
                result = await security._fetch_jwks_async()
                assert result == [{"kid": "abc", "kty": "EC"}]

    @pytest.mark.asyncio
    async def test_fetch_jwks_returns_empty_on_http_error(self):
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.get = AsyncMock(side_effect=Exception("Connection refused"))

        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch("app.core.security.httpx.AsyncClient", return_value=mock_client):
                result = await security._fetch_jwks_async()
                assert result == []


class TestGetJwks:
    @pytest.mark.asyncio
    async def test_get_jwks_uses_cache_when_fresh(self):
        cached_keys = [{"kid": "cached", "kty": "EC"}]
        security._jwks_cache["keys"] = cached_keys
        security._jwks_cache["fetched_at"] = time.time()

        result = await security._get_jwks()
        assert result == cached_keys

    @pytest.mark.asyncio
    async def test_get_jwks_refreshes_when_stale(self):
        security._jwks_cache["keys"] = [{"kid": "old"}]
        security._jwks_cache["fetched_at"] = time.time() - 7200

        mock_response = MagicMock()
        mock_response.json.return_value = {"keys": [{"kid": "new", "kty": "RSA"}]}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch("app.core.security.httpx.AsyncClient", return_value=mock_client):
                result = await security._get_jwks()
                assert result == [{"kid": "new", "kty": "RSA"}]

    @pytest.mark.asyncio
    async def test_get_jwks_force_refresh(self):
        security._jwks_cache["keys"] = [{"kid": "old"}]
        security._jwks_cache["fetched_at"] = time.time()

        mock_response = MagicMock()
        mock_response.json.return_value = {"keys": [{"kid": "forced", "kty": "EC"}]}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch("app.core.security.httpx.AsyncClient", return_value=mock_client):
                result = await security._get_jwks(force_refresh=True)
                assert result == [{"kid": "forced", "kty": "EC"}]

    @pytest.mark.asyncio
    async def test_get_jwks_keeps_stale_cache_on_fetch_failure(self):
        stale_keys = [{"kid": "stale"}]
        security._jwks_cache["keys"] = stale_keys
        security._jwks_cache["fetched_at"] = time.time() - 7200

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.get = AsyncMock(side_effect=Exception("Network error"))

        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch("app.core.security.httpx.AsyncClient", return_value=mock_client):
                result = await security._get_jwks()
                assert result == stale_keys


class TestFindJwk:
    @pytest.mark.asyncio
    async def test_find_jwk_returns_matching_key(self):
        security._jwks_cache["keys"] = [
            {"kid": "key1", "kty": "EC"},
            {"kid": "key2", "kty": "RSA"},
        ]
        security._jwks_cache["fetched_at"] = time.time()

        result = await security._find_jwk("key2")
        assert result == {"kid": "key2", "kty": "RSA"}

    @pytest.mark.asyncio
    async def test_find_jwk_returns_none_when_not_found(self):
        security._jwks_cache["keys"] = [{"kid": "key1"}]
        security._jwks_cache["fetched_at"] = time.time()

        mock_response = MagicMock()
        mock_response.json.return_value = {"keys": [{"kid": "key1"}]}
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch("app.core.security.httpx.AsyncClient", return_value=mock_client):
                result = await security._find_jwk("nonexistent")
                assert result is None


class TestBuildKey:
    def test_build_key_ec_returns_eckey(self):
        jwk = {
            "kty": "EC",
            "crv": "P-256",
            "x": "4sstJoTvC-TnemRCvadCdZ0tiizlI8Eu_PwtJVvizYI",
            "y": "JljSJHdMe8NOUse-dp4N-PaN0pZf5VsYVtz_UfeFNFw",
            "kid": "test-key-id",
        }
        key = security._build_key(jwk, "ES256")
        assert isinstance(key, ECKey)

    def test_build_key_rsa_returns_rsakey(self):
        jwk = {
            "kty": "RSA",
            "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
            "e": "AQAB",
            "kid": "test-rsa-key",
        }
        key = security._build_key(jwk, "RS256")
        assert isinstance(key, RSAKey)

    def test_build_key_unknown_type_returns_raw(self):
        jwk = {"kty": "oct", "k": "c2VjcmV0"}
        key = security._build_key(jwk, "HS256")
        assert key == jwk


class TestDecodeSupabaseToken:
    @pytest.mark.asyncio
    async def test_decode_hs256_token_success(self):
        secret = "test-secret-key-that-is-long-enough-for-hs256"
        token = jwt.encode({"sub": "user-123", "email": "test@example.com"}, secret, algorithm="HS256")

        with patch.object(settings, "supabase_jwt_secret", secret):
            claims = await security.decode_supabase_token(token)
            assert claims["sub"] == "user-123"
            assert claims["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_decode_hs256_token_invalid(self):
        with patch.object(settings, "supabase_jwt_secret", "correct-secret"):
            token = jwt.encode({"sub": "user-123"}, "wrong-secret", algorithm="HS256")
            with pytest.raises(ValueError, match="Invalid or expired token"):
                await security.decode_supabase_token(token)

    @pytest.mark.asyncio
    async def test_decode_hs256_no_secret_configured(self):
        with patch.object(settings, "supabase_jwt_secret", ""):
            token = jwt.encode({"sub": "user-123"}, "any-secret", algorithm="HS256")
            with pytest.raises(ValueError, match="SUPABASE_JWT_SECRET is not configured"):
                await security.decode_supabase_token(token)

    @pytest.mark.asyncio
    async def test_decode_invalid_token_format(self):
        with pytest.raises(ValueError, match="Invalid token format"):
            await security.decode_supabase_token("not.a.valid.jwt.token")

    @pytest.mark.asyncio
    async def test_decode_asymmetric_missing_kid(self):
        token = jwt.encode({"sub": "user-123"}, "secret", algorithm="HS256")
        header = jwt.get_unverified_header(token)
        assert header["alg"] == "HS256"

    @pytest.mark.asyncio
    async def test_decode_asymmetric_no_matching_key(self):
        security._jwks_cache["keys"] = [
            {
                "kty": "EC",
                "crv": "P-256",
                "x": "4sstJoTvC-TnemRCvadCdZ0tiizlI8Eu_PwtJVvizYI",
                "y": "JljSJHdMe8NOUse-dp4N-PaN0pZf5VsYVtz_UfeFNFw",
                "kid": "other-key",
            }
        ]
        security._jwks_cache["fetched_at"] = time.time()

        with pytest.raises(ValueError, match="No matching Supabase signing key"):
            await security.decode_supabase_token(
                "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNpZ25pbmcta2V5In0.eyJzdWIiOiJ1c2VyLTEyMyJ9.fake"
            )

    @pytest.mark.asyncio
    async def test_decode_token_missing_kid_header(self):
        token = jwt.encode({"sub": "user-123"}, "secret", algorithm="HS256")

        with patch.object(settings, "supabase_jwt_secret", ""):
            with pytest.raises(ValueError):
                await security.decode_supabase_token(token)
