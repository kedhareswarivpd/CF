from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings
from app.core.logger import logger


async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.smtp_host:
        logger.info(f"[email:skipped, no SMTP configured] to={to} subject={subject}")
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content("This email requires an HTML-capable client.")
    message.add_alternative(html, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user or None,
            password=settings.smtp_pass or None,
            start_tls=True,
        )
        logger.info(f"Email sent to {to}: {subject}")
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Failed to send email to {to}: {exc}")


async def send_welcome_email(name: str, email: str) -> None:
    await send_email(email, f"Welcome to {settings.app_name}", f"<p>Hi {name},</p><p>Your account has been created successfully.</p>")


async def send_password_reset_email(name: str, email: str, reset_url: str) -> None:
    await send_email(
        email,
        "Password Reset Request",
        f"<p>Hi {name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p>"
        f'<p><a href="{reset_url}">{reset_url}</a></p>',
    )


async def send_contact_notification(name: str, email: str, message: str, subject: str | None) -> None:
    await send_email(
        settings.smtp_from,
        f"New Contact Form Submission: {subject or 'General Inquiry'}",
        f"<p><strong>Name:</strong> {name}</p><p><strong>Email:</strong> {email}</p><p><strong>Message:</strong> {message}</p>",
    )
