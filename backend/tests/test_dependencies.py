"""Unit tests for auth dependencies, role checking, and IP resolution."""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import Request
from fastapi.security import HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.dependencies import (
    _resolve_user,
    get_client_ip,
    get_current_user,
    get_optional_user,
    require_roles,
)
from app.core.errors import ApiError
from app.models.user import User


class TestResolveUser:
    @pytest.mark.asyncio
    async def test_resolve_existing_user(self):
        existing_user = User(
            id=uuid.uuid4(),
            name="Existing User",
            email="existing@example.com",
            role="client",
        )
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_user
        mock_db.execute.return_value = mock_result

        claims = {"sub": str(existing_user.id), "email": "existing@example.com"}
        user = await _resolve_user(claims, mock_db)

        assert user is not None
        assert user.id == existing_user.id
        assert user.email == "existing@example.com"

    @pytest.mark.asyncio
    async def test_resolve_user_auto_provisions_new_user(self):
        new_user_id = uuid.uuid4()
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        claims = {
            "sub": str(new_user_id),
            "email": "newuser@example.com",
            "user_metadata": {"name": "New User"},
        }
        user = await _resolve_user(claims, mock_db)

        assert user is not None
        assert user.id == new_user_id
        assert user.email == "newuser@example.com"
        assert user.name == "New User"
        assert user.role == "client"
        assert user.is_active is True
        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_resolve_user_auto_provision_without_metadata(self):
        new_user_id = uuid.uuid4()
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        claims = {"sub": str(new_user_id), "email": "newuser@example.com"}
        user = await _resolve_user(claims, mock_db)

        assert user is not None
        assert user.name == "newuser@example.com"

    @pytest.mark.asyncio
    async def test_resolve_user_email_verified(self):
        new_user_id = uuid.uuid4()
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        claims = {
            "sub": str(new_user_id),
            "email": "newuser@example.com",
            "email_confirmed_at": "2024-01-01T00:00:00Z",
        }
        user = await _resolve_user(claims, mock_db)

        assert user.is_email_verified is True


class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_no_credentials_raises_unauthorized(self):
        with pytest.raises(ApiError) as exc_info:
            await get_current_user(credentials=None, db=AsyncMock())
        assert exc_info.value.status_code == 401
        assert "Authentication token missing" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_invalid_token_raises_unauthorized(self):
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid-token"
        )
        with patch("app.core.dependencies.decode_supabase_token", side_effect=ValueError("bad token")):
            with pytest.raises(ApiError) as exc_info:
                await get_current_user(credentials=credentials, db=AsyncMock())
            assert exc_info.value.status_code == 401
            assert "Invalid or expired token" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_valid_token_returns_user(self):
        user_id = uuid.uuid4()
        mock_user = User(id=user_id, name="Test", email="test@example.com", role="client")

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()
        mock_db.add = MagicMock()
        mock_db.rollback = AsyncMock()

        claims = {"sub": str(user_id), "email": "test@example.com"}
        user = await _resolve_user(claims, mock_db)

        assert user is not None
        assert user.id == user_id

    @pytest.mark.asyncio
    async def test_deactivated_user_raises_unauthorized(self):
        user_id = uuid.uuid4()
        mock_user = User(id=user_id, name="Test", email="test@example.com", role="client", is_active=False)
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="valid-token"
        )
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with patch("app.core.dependencies.decode_supabase_token", new_callable=AsyncMock) as mock_decode:
            mock_decode.return_value = {"sub": str(user_id), "email": "test@example.com"}
            with pytest.raises(ApiError) as exc_info:
                await get_current_user(credentials=credentials, db=mock_db)
            assert exc_info.value.status_code == 401


class TestGetOptionalUser:
    @pytest.mark.asyncio
    async def test_no_credentials_returns_none(self):
        result = await get_optional_user(credentials=None, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_invalid_token_returns_none(self):
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid-token"
        )
        with patch("app.core.dependencies.decode_supabase_token", side_effect=ValueError("bad token")):
            result = await get_optional_user(credentials=credentials, db=AsyncMock())
            assert result is None

    @pytest.mark.asyncio
    async def test_valid_token_returns_user(self):
        user_id = uuid.uuid4()
        mock_user = User(id=user_id, name="Test", email="test@example.com", role="client", is_active=True)

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()
        mock_db.add = MagicMock()
        mock_db.rollback = AsyncMock()

        claims = {"sub": str(user_id), "email": "test@example.com"}
        user = await _resolve_user(claims, mock_db)

        assert user is not None
        assert user.id == user_id
        assert user.is_active is True

    @pytest.mark.asyncio
    async def test_deactivated_user_returns_none(self):
        user_id = uuid.uuid4()
        mock_user = User(id=user_id, name="Test", email="test@example.com", role="client", is_active=False)
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="valid-token"
        )
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with patch("app.core.dependencies.decode_supabase_token", new_callable=AsyncMock) as mock_decode:
            mock_decode.return_value = {"sub": str(user_id), "email": "test@example.com"}
            result = await get_optional_user(credentials=credentials, db=mock_db)

        assert result is None


class TestRequireRoles:
    @pytest.mark.asyncio
    async def test_super_admin_bypasses_role_check(self):
        mock_user = User(id=uuid.uuid4(), name="Admin", email="admin@example.com", role="super_admin")
        dependency = require_roles("admin", "hr")

        with patch("app.core.dependencies.get_current_user", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_user
            result = await dependency(current_user=mock_user)

        assert result.role == "super_admin"

    @pytest.mark.asyncio
    async def test_matching_role_returns_user(self):
        mock_user = User(id=uuid.uuid4(), name="HR", email="hr@example.com", role="hr")
        dependency = require_roles("admin", "hr")

        result = await dependency(current_user=mock_user)
        assert result.role == "hr"

    @pytest.mark.asyncio
    async def test_non_matching_role_raises_forbidden(self):
        mock_user = User(id=uuid.uuid4(), name="Dev", email="dev@example.com", role="developer")
        dependency = require_roles("admin", "hr")

        with pytest.raises(ApiError) as exc_info:
            await dependency(current_user=mock_user)
        assert exc_info.value.status_code == 403
        assert "permission" in exc_info.value.message.lower()


class TestGetClientIp:
    def test_returns_client_host_by_default(self):
        mock_request = MagicMock(spec=Request)
        mock_request.client.host = "192.168.1.100"
        mock_request.headers = {}

        ip = get_client_ip(mock_request)
        assert ip == "192.168.1.100"

    def test_returns_x_forwarded_for_when_trusted(self):
        mock_request = MagicMock(spec=Request)
        mock_request.client.host = "10.0.0.1"
        mock_request.headers = {"x-forwarded-for": "203.0.113.50, 70.41.3.18"}

        with patch.object(settings, "trust_proxy_headers", True):
            ip = get_client_ip(mock_request)
            assert ip == "203.0.113.50"

    def test_ignores_x_forwarded_for_when_not_trusted(self):
        mock_request = MagicMock(spec=Request)
        mock_request.client.host = "192.168.1.100"
        mock_request.headers = {"x-forwarded-for": "203.0.113.50"}

        with patch.object(settings, "trust_proxy_headers", False):
            ip = get_client_ip(mock_request)
            assert ip == "192.168.1.100"

    def test_returns_unknown_when_no_client(self):
        mock_request = MagicMock(spec=Request)
        mock_request.client = None
        mock_request.headers = {}

        ip = get_client_ip(mock_request)
        assert ip == "unknown"
