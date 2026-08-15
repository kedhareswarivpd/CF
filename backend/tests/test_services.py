"""Unit tests for email, notification, and supabase services."""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.config import settings
from app.core.errors import ApiError
from app.models.enums import NotificationType
from app.models.notification import Notification
from app.models.user import User
from app.services.email_service import (
    _esc,
    send_contact_notification,
    send_email,
    send_password_reset_email,
    send_welcome_email,
)
from app.services.notification_service import notify_roles, notify_user
from app.services.supabase_client import get_admin_client, get_anon_client


class TestSendEmail:
    @pytest.mark.asyncio
    async def test_skips_when_no_smtp_configured(self):
        with patch.object(settings, "smtp_host", ""):
            with patch("app.services.email_service.aiosmtplib.send") as mock_send:
                await send_email("test@example.com", "Subject", "<p>Body</p>")
                mock_send.assert_not_called()

    @pytest.mark.asyncio
    async def test_sends_when_smtp_configured(self):
        with patch.object(settings, "smtp_host", "smtp.example.com"):
            with patch.object(settings, "smtp_port", 587):
                with patch.object(settings, "smtp_from", "noreply@example.com"):
                    with patch.object(settings, "smtp_user", "user"):
                        with patch.object(settings, "smtp_pass", "pass"):
                            with patch("app.services.email_service.aiosmtplib.send") as mock_send:
                                await send_email("to@example.com", "Subject", "<p>Body</p>")
                                mock_send.assert_called_once()

    @pytest.mark.asyncio
    async def test_logs_error_on_send_failure(self):
        with patch.object(settings, "smtp_host", "smtp.example.com"):
            with patch.object(settings, "smtp_port", 587):
                with patch.object(settings, "smtp_from", "noreply@example.com"):
                    with patch.object(settings, "smtp_user", None):
                        with patch.object(settings, "smtp_pass", None):
                            with patch("app.services.email_service.aiosmtplib.send", side_effect=Exception("SMTP error")):
                                with patch("app.services.email_service.logger") as mock_logger:
                                    await send_email("to@example.com", "Subject", "<p>Body</p>")
                                    mock_logger.error.assert_called_once()


class TestEsc:
    def test_escapes_html_entities(self):
        assert _esc("<script>alert('xss')</script>") == "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"

    def test_escapes_ampersand(self):
        assert _esc("A & B") == "A &amp; B"

    def test_handles_none(self):
        assert _esc(None) == ""

    def test_handles_numbers(self):
        assert _esc(42) == "42"


class TestSendWelcomeEmail:
    @pytest.mark.asyncio
    async def test_sends_welcome_with_escaped_name(self):
        with patch("app.services.email_service.send_email") as mock_send:
            await send_welcome_email("John <script>", "john@example.com")
            mock_send.assert_called_once()
            call_args = mock_send.call_args
            assert call_args[0][0] == "john@example.com"
            assert "Welcome" in call_args[0][1]
            assert "&lt;script&gt;" in call_args[0][2]


class TestSendPasswordResetEmail:
    @pytest.mark.asyncio
    async def test_sends_reset_with_safe_url(self):
        with patch("app.services.email_service.send_email") as mock_send:
            await send_password_reset_email(
                "John", "john@example.com", "https://example.com/reset?token=abc"
            )
            mock_send.assert_called_once()
            call_args = mock_send.call_args
            assert "Password Reset" in call_args[0][1]
            assert "https://example.com/reset?token=abc" in call_args[0][2]


class TestSendContactNotification:
    @pytest.mark.asyncio
    async def test_sends_to_smtp_from(self):
        with patch.object(settings, "smtp_from", "admin@example.com"):
            with patch("app.services.email_service.send_email") as mock_send:
                await send_contact_notification(
                    "Jane", "jane@example.com", "Hello!", "Support"
                )
                mock_send.assert_called_once()
                call_args = mock_send.call_args
                assert call_args[0][0] == "admin@example.com"
                assert "Jane" in call_args[0][2]
                assert "jane@example.com" in call_args[0][2]


class TestNotifyUser:
    @pytest.mark.asyncio
    async def test_creates_notification(self):
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        await notify_user(mock_db, user_id, "Test Title", "Test Message")

        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()

        notification = mock_db.add.call_args[0][0]
        assert isinstance(notification, Notification)
        assert notification.user_id == user_id
        assert notification.title == "Test Title"
        assert notification.message == "Test Message"
        assert notification.type == NotificationType.info

    @pytest.mark.asyncio
    async def test_creates_notification_with_link(self):
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        await notify_user(
            mock_db, user_id, "Alert", "Check this", NotificationType.warning, "/dashboard"
        )

        notification = mock_db.add.call_args[0][0]
        assert notification.link == "/dashboard"
        assert notification.type == NotificationType.warning


class TestNotifyRoles:
    @pytest.mark.asyncio
    async def test_fans_out_to_matching_users(self):
        mock_db = AsyncMock()
        user_ids = [uuid.uuid4(), uuid.uuid4()]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = user_ids
        mock_db.execute.return_value = mock_result

        await notify_roles(mock_db, ["admin", "hr"], "New Policy", "Please review")

        assert mock_db.add.call_count == 2
        mock_db.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_no_commit_when_no_matching_users(self):
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        await notify_roles(mock_db, ["nonexistent"], "Title", "Message")

        mock_db.add.assert_not_called()
        mock_db.commit.assert_not_called()


class TestGetAnonClient:
    def test_raises_when_not_configured(self):
        get_anon_client.cache_clear()
        with patch.object(settings, "supabase_url", ""):
            with pytest.raises(ApiError) as exc_info:
                get_anon_client()
            assert exc_info.value.status_code == 500

    def test_returns_client_when_configured(self):
        get_anon_client.cache_clear()
        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch.object(settings, "supabase_anon_key", "anon-key"):
                with patch("app.services.supabase_client.create_client") as mock_create:
                    get_anon_client()
                    mock_create.assert_called_once_with(
                        "https://example.supabase.co", "anon-key"
                    )


class TestGetAdminClient:
    def test_raises_when_not_configured(self):
        get_admin_client.cache_clear()
        with patch.object(settings, "supabase_url", ""):
            with pytest.raises(ApiError) as exc_info:
                get_admin_client()
            assert exc_info.value.status_code == 500

    def test_returns_client_when_configured(self):
        get_admin_client.cache_clear()
        with patch.object(settings, "supabase_url", "https://example.supabase.co"):
            with patch.object(settings, "supabase_service_role_key", "service-key"):
                with patch("app.services.supabase_client.create_client") as mock_create:
                    get_admin_client()
                    mock_create.assert_called_once_with(
                        "https://example.supabase.co", "service-key"
                    )
