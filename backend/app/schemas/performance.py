from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedRead


class PerformanceReviewBase(BaseModel):
    employee_id: UUID
    reviewer_id: UUID
    review_period: str = Field(min_length=1, max_length=50)
    review_date: date
    rating: int | None = Field(None, ge=1, le=10)
    strengths: str | None = None
    areas_for_improvement: str | None = None
    goals: str | None = None
    comments: str | None = None
    status: str = "draft"


class PerformanceReviewCreate(PerformanceReviewBase):
    pass


class PerformanceReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=10)
    strengths: str | None = None
    areas_for_improvement: str | None = None
    goals: str | None = None
    comments: str | None = None
    status: str | None = None


class PerformanceReviewOut(PerformanceReviewBase, TimestampedRead):
    pass
