import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.errors import ApiError
from app.core.security import decode_supabase_token
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest, LoginRequest, LoginResponse, LogoutRequest,
    RefreshRequest, RegisterRequest, ResetPasswordRequest, TokenPair, UserRead,
)
from app.services.supabase_client import get_admin_client, get_anon_client
from app.utils.responses import success_response

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=dict, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if existing:
        raise ApiError.conflict("An account with this email already exists")

    admin = get_admin_client()
    try:
        auth_response = await run_in_threadpool(
            admin.auth.admin.create_user,
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {"name": payload.name},
            },
        )
    except Exception as exc:  # noqa: BLE001 — surface Supabase's own error message
        raise ApiError.bad_request(f"Could not create account: {exc}") from exc

    supabase_user_id = uuid.UUID(auth_response.user.id)
    user = User(
        id=supabase_user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return success_response(data=UserRead.model_validate(user), message="Account created successfully", status_code=201)


@router.post("/login", response_model=dict)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    anon = get_anon_client()
    try:
        auth_response = await run_in_threadpool(
            anon.auth.sign_in_with_password, {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:  # noqa: BLE001
        raise ApiError.unauthorized("Invalid email or password") from exc

    session = auth_response.session
    if session is None:
        raise ApiError.unauthorized("Invalid email or password")

    claims = decode_supabase_token(session.access_token)
    user_id = uuid.UUID(claims["sub"])
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()

    if user is None:
        # First login for an account that exists in Supabase but has no profile row yet
        metadata = claims.get("user_metadata") or {}
        user = User(id=user_id, email=payload.email, name=metadata.get("name") or payload.email, role="client", is_active=True)
        db.add(user)
    elif not user.is_active:
        raise ApiError.forbidden("Your account has been deactivated")

    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    response = LoginResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        expires_in=session.expires_in,
        user=UserRead.model_validate(user),
    )
    return success_response(data=response, message="Logged in successfully")


@router.post("/refresh-token", response_model=dict)
async def refresh_token_endpoint(payload: RefreshRequest):
    anon = get_anon_client()
    try:
        auth_response = await run_in_threadpool(anon.auth.refresh_session, payload.refresh_token)
    except Exception as exc:  # noqa: BLE001
        raise ApiError.unauthorized("Invalid or expired refresh token") from exc

    session = auth_response.session
    if session is None:
        raise ApiError.unauthorized("Invalid or expired refresh token")

    return success_response(
        data=TokenPair(access_token=session.access_token, refresh_token=session.refresh_token, expires_in=session.expires_in),
        message="Token refreshed",
    )


@router.post("/logout", response_model=dict)
async def logout(payload: LogoutRequest):
    admin = get_admin_client()
    try:
        await run_in_threadpool(admin.auth.admin.sign_out, payload.access_token)
    except Exception:  # noqa: BLE001 — logout is best-effort; an already-expired token shouldn't error the caller
        pass
    return success_response(message="Logged out successfully")


@router.get("/me", response_model=dict)
async def me(current_user: User = Depends(get_current_user)):
    return success_response(data=UserRead.model_validate(current_user), message="Current user fetched")


@router.post("/forgot-password", response_model=dict)
async def forgot_password(payload: ForgotPasswordRequest):
    anon = get_anon_client()
    options = {"redirect_to": payload.redirect_to} if payload.redirect_to else {}
    try:
        await run_in_threadpool(anon.auth.reset_password_for_email, payload.email, options)
    except Exception:  # noqa: BLE001 — don't reveal whether the email exists
        pass
    return success_response(message="If the email exists, a password reset link has been sent")


@router.post("/reset-password", response_model=dict)
async def reset_password(payload: ResetPasswordRequest):
    try:
        claims = decode_supabase_token(payload.recovery_token)
    except ValueError as exc:
        raise ApiError.bad_request("Password reset token is invalid or has expired") from exc

    admin = get_admin_client()
    try:
        await run_in_threadpool(admin.auth.admin.update_user_by_id, claims["sub"], {"password": payload.password})
    except Exception as exc:  # noqa: BLE001
        raise ApiError.bad_request(f"Could not reset password: {exc}") from exc

    return success_response(message="Password has been reset successfully")
