import uuid

from sqlalchemy import Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import LeadSource, LeadStatus


class Lead(Base):
    __tablename__ = "leads"

    contact_submission_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("contact_submissions.id"))
    company: Mapped[str | None] = mapped_column(String(200))
    contact_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30))
    source: Mapped[LeadSource] = mapped_column(Enum(LeadSource, name="lead_source"), default=LeadSource.other)
    status: Mapped[LeadStatus] = mapped_column(Enum(LeadStatus, name="lead_status"), default=LeadStatus.new)
    estimated_value: Mapped[float | None] = mapped_column(Numeric(12, 2))
    notes: Mapped[str | None] = mapped_column(Text)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    converted_client_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id"))

    owner = relationship("User", foreign_keys=[owner_id])
    proposals = relationship("Proposal", back_populates="lead")
