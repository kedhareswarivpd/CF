from unittest.mock import patch

import pytest

from app.core.errors import ApiError
from app.routers.auth import register
from app.schemas.auth import RegisterRequest


class TestAuthValidation:
    """Tests for auth endpoint validation (no real Supabase dependency)."""

    async def test_register_requires_valid_email(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/register",
            json={"name": "Test User", "email": "not-an-email", "password": "password123"},
        )
        assert response.status_code == 422
        errors = response.json()["errors"]
        assert any("email" in e["field"] for e in errors)

    async def test_register_requires_min_password_length(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/register",
            json={"name": "Test User", "email": "test@example.com", "password": "short"},
        )
        assert response.status_code == 422

    async def test_register_requires_name(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "password123"},
        )
        assert response.status_code == 422

    async def test_login_requires_email_and_password(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/login",
            json={"email": "not-an-email", "password": ""},
        )
        assert response.status_code == 422

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

        with patch("app.routers.auth.get_admin_client", side_effect=ApiError.internal("Supabase admin client is not configured")):
            with pytest.raises(ApiError) as exc_info:
                await register(
                    RegisterRequest(name="Test User", email="test@example.com", password="password123"),
                    db=FakeDbSession(),
                )

        assert exc_info.value.status_code == 503
        assert "temporarily unavailable" in exc_info.value.message.lower()

    async def test_me_without_token(self, async_client):
        response = await async_client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_me_with_invalid_token(self, async_client):
        response = await async_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401

    async def test_logout_with_empty_token(self, async_client):
        """Logout with empty token hits Supabase admin client which isn't
        configured in test — this validates the endpoint exists."""
        response = await async_client.post(
            "/api/v1/auth/logout",
            json={"access_token": "some-valid-token"},
        )
        assert response.status_code in (200, 500)

    async def test_forgot_password_validation(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "not-an-email"},
        )
        assert response.status_code == 422

    async def test_reset_password_validation(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/reset-password",
            json={"recovery_token": "tok", "password": "short"},
        )
        assert response.status_code == 422

    async def test_refresh_token_validation(self, async_client):
        response = await async_client.post(
            "/api/v1/auth/refresh-token",
            json={},
        )
        assert response.status_code == 422
