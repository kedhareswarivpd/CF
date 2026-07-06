from app.crud.base import CRUDBase
from app.models.meeting import Meeting
from app.schemas.ops import MeetingCreate, MeetingOut, MeetingUpdate
from app.utils.router_factory import build_crud_router

crud = CRUDBase(Meeting, searchable_fields=["title"])

router = build_crud_router(
    crud, MeetingCreate, MeetingUpdate, MeetingOut,
    prefix="/meetings", tags=["Meetings"],
    public_read=False, write_roles=["admin", "project_manager", "sales"],
    allowed_filters=["project_id", "status", "organizer_id"],
    before_create=lambda data, user: {**data, "organizer_id": user.id},
)
