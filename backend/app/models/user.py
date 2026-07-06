import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import UserRole


class User(Base):
    """
    Profile table for an authenticated Supabase user.

    `id` is NOT auto-generated here — it must always equal the corresponding
    `auth.users.id` row that Supabase's own Auth service manages. Passwords,
    email verification, MFA, and session/refresh tokens are all handled by
    Supabase Auth; this table only stores the app-specific profile fields
    (name, phone, avatar, RBAC role, portal linkage) that Supabase doesn't
    know about.
    
    Note: We don't enforce a foreign key constraint to auth.users since it's
    managed by Supabase in a separate schema. The application must ensure
    that user IDs are synced with Supabase's auth table.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    avatar: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.guest, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    employee_profile = relationship("Employee", back_populates="user", uselist=False)
    client_profile = relationship("Client", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
