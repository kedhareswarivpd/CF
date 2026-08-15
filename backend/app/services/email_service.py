import html
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings
from app.core.logger import logger


async def send_email(to: str, subject: str, html_body: str) -> None:
    if not settings.smtp_host:
        logger.info("[email:skipped, no SMTP configured] to=%s subject=%s", to, subject)
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content("This email requires an HTML-capable client.")
    message.add_alternative(html_body, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user or None,
            password=settings.smtp_pass or None,
            start_tls=True,
        )
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to send email to %s: %s", to, exc)


def _esc(value: object) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


async def send_welcome_email(name: str, email: str) -> None:
    await send_email(
        email,
        f"Welcome to {settings.app_name}",
        f"<p>Hi {_esc(name)},</p><p>Your account has been created successfully.</p>",
    )


async def send_password_reset_email(name: str, email: str, reset_url: str) -> None:
    safe_name = _esc(name)
    safe_url = _esc(reset_url)
    await send_email(
        email,
        "Password Reset Request",
        f"<p>Hi {safe_name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p>"
        f'<p><a href="{safe_url}">{safe_url}</a></p>',
    )


async def send_contact_notification(name: str, email: str, message: str, subject: str | None) -> None:
    await send_email(
        settings.smtp_from,
        f"New Contact Form Submission: {subject or 'General Inquiry'}",
        f"<p><strong>Name:</strong> {_esc(name)}</p><p><strong>Email:</strong> {_esc(email)}</p>"
        f"<p><strong>Message:</strong> {_esc(message)}</p>",
    )
