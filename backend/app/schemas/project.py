import uuid
from datetime import date

from pydantic import BaseModel

from app.models.enums import ProjectStatus
from app.schemas.common import TimestampedRead


class ProjectCreate(BaseModel):
    title: str
    slug: str | None = None
    client_id: uuid.UUID | None = None
    overview: str | None = None
    challenge: str | None = None
    solution: str | None = None
    technology_stack: list[str] = []
    architecture_notes: str | None = None
    industry: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    budget: float | None = None
    status: ProjectStatus = ProjectStatus.planning
    project_manager_id: uuid.UUID | None = None
    cover_image: str | None = None
    video_url: str | None = None
    is_featured: bool = False
    is_published: bool = False


class ProjectUpdate(BaseModel):
    title: str | None = None
    client_id: uuid.UUID | None = None
    overview: str | None = None
    challenge: str | None = None
    solution: str | None = None
    technology_stack: list[str] | None = None
    status: ProjectStatus | None = None
    progress_percent: int | None = None
    budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    project_manager_id: uuid.UUID | None = None
    cover_image: str | None = None
    video_url: str | None = None
    is_featured: bool | None = None
    is_published: bool | None = None


class ProjectOut(TimestampedRead):
    title: str
    slug: str
    client_id: uuid.UUID | None = None
    overview: str | None = None
    challenge: str | None = None
    solution: str | None = None
    technology_stack: list[str] = []
    industry: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    budget: float | None = None
    status: ProjectStatus
    progress_percent: int
    project_manager_id: uuid.UUID | None = None
    cover_image: str | None = None
    video_url: str | None = None
    is_featured: bool
    is_published: bool


class AssignTeamRequest(BaseModel):
    employee_ids: list[uuid.UUID] = []
