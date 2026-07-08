import uuid

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole
from app.schemas.common import TimestampedRead


class RegisterRequest(BaseModel):
    """
    Public self-serve signup is intentionally Client-only — there is no `role`
    field here. Employee/Admin/HR accounts are provisioned by an authenticated
    Admin/HR user via `POST /users` (see routers/users.py), never self-selected
    by an anonymous caller. Do not add `role` back here without an auth gate.
    """

    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    access_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    redirect_to: str | None = None


class ResetPasswordRequest(BaseModel):
    """
    `recovery_token` is the access token Supabase issues after the person
    follows the password-recovery email link (the frontend exchanges the
    link's fragment for a session and forwards the resulting access token
    here alongside the new password).
    """

    recovery_token: str
    password: str = Field(min_length=8)


class UserRead(TimestampedRead):
    name: str
    email: EmailStr
    phone: str | None = None
    avatar: str | None = None
    role: UserRole
    is_active: bool
    is_email_verified: bool


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int | None = None


class LoginResponse(TokenPair):
    user: UserRead
