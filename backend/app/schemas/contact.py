from pydantic import BaseModel, EmailStr

from app.models.enums import ContactStatus
from app.schemas.common import TimestampedRead


class ContactSubmit(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    department: str | None = None
    subject: str | None = None
    message: str


class ContactOut(TimestampedRead):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    department: str | None = None
    subject: str | None = None
    message: str
    status: ContactStatus


class ContactStatusUpdate(BaseModel):
    status: ContactStatus
