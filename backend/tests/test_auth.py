"""Unit tests for auth business logic (not covered by API endpoint tests)."""
from unittest.mock import patch

import pytest

from app.core.errors import ApiError
from app.routers.auth import register
from app.schemas.auth import RegisterRequest


class TestAuthBusinessLogic:
    """Tests for auth endpoint business logic (no real Supabase dependency)."""

    async def test_register_returns_service_unavailable_when_auth_client_is_unavailable(self):
        class FakeDbSession:
            async def execute(self, *args, **kwargs):
                class FakeResult:
                    def scalar_one_or_none(self):
                        return None

                return FakeResult()

            async def commit(self):
                return None

            async def refresh(self, *args, **kwargs):
                return None

            async def rollback(self):
                return None

            def add(self, *args, **kwargs):
                return None

        with patch("app.routers.auth.get_admin_client", side_effect=ApiError.service_unavailable("Supabase admin client is temporarily unavailable")):
            with pytest.raises(ApiError) as exc_info:
                await register(
                    RegisterRequest(name="Test User", email="test@example.com", password="password123"),
                    db=FakeDbSession(),
                )

        assert exc_info.value.status_code == 503
        assert "temporarily unavailable" in exc_info.value.message.lower()
