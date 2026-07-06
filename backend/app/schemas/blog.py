import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.enums import BlogStatus, CommentStatus
from app.schemas.common import TimestampedRead


class BlogCreate(BaseModel):
    title: str
    slug: str | None = None
    excerpt: str | None = None
    content: str
    cover_image: str | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] = []
    status: BlogStatus = BlogStatus.draft
    meta_title: str | None = None
    meta_description: str | None = None


class BlogUpdate(BaseModel):
    title: str | None = None
    excerpt: str | None = None
    content: str | None = None
    cover_image: str | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] | None = None
    status: BlogStatus | None = None


class BlogOut(TimestampedRead):
    title: str
    slug: str
    excerpt: str | None = None
    content: str
    cover_image: str | None = None
    author_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] = []
    status: BlogStatus
    views: int
    published_at: datetime | None = None


class CommentCreate(BaseModel):
    name: str
    email: EmailStr
    content: str


class CommentOut(TimestampedRead):
    blog_id: uuid.UUID
    name: str
    email: EmailStr
    content: str
    status: CommentStatus
