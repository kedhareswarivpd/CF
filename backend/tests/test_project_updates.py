"""Regression tests for the Daily Project Update feature added during the
UAT closure pass (docs/requirments/UAT_REPORT.md §2) — this entity and its
authorization rules did not exist before. Also covers the project<->proposal
linkage + duplicate-project-creation guard added in the same pass (§1)."""
import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.errors import ApiError
from app.models.employee import Employee
from app.models.project import Project
from app.models.user import User
from app.routers.projects import create_project, post_project_update
from app.schemas.project import ProjectCreate
from app.schemas.project_update import ProjectUpdateCreate


def _stamps() -> dict:
    now = datetime.now(UTC)
    return dict(created_at=now, updated_at=now)


def _stamp_on_refresh(obj) -> None:
    """Mimics what a real db.refresh() populates after commit — AsyncMock's
    refresh() is a no-op and the handlers under test serialize the object
    immediately afterward. Same pattern as test_gap_fixes.py."""
    if getattr(obj, "id", None) is None:
        obj.id = uuid.uuid4()
    now = datetime.now(UTC)
    obj.created_at = now
    obj.updated_at = now
    if getattr(obj, "client_visible", None) is None:
        obj.client_visible = False


def _project_defaults() -> dict:
    return dict(
        technology_stack=[], deliverables=[], gallery=[], downloads=[],
        progress_percent=0, is_featured=False, is_published=False, **_stamps(),
    )


def _make_user(role: str, **overrides) -> User:
    defaults = dict(id=uuid.uuid4(), name="Someone", email="someone@example.com", password_hash="x", role=role)
    defaults.update(overrides)
    return User(**defaults)


class TestProjectUpdateAuthorization:
    @pytest.mark.asyncio
    async def test_employee_on_team_can_post_update(self):
        user = _make_user("developer")
        project_id = uuid.uuid4()
        employee = Employee(id=uuid.uuid4(), user_id=user.id, employee_code="EMP-1")
        project = Project(id=project_id, title="X", slug="x", status="planning", **_project_defaults())

        mock_db = AsyncMock()
        mock_db.add = MagicMock()
        mock_db.refresh.side_effect = _stamp_on_refresh

        # First execute() resolves the Employee row, second confirms team membership.
        team_row = MagicMock(scalar_one_or_none=MagicMock(return_value=employee.id))
        emp_row = MagicMock(scalar_one_or_none=MagicMock(return_value=employee))
        mock_db.execute.side_effect = [emp_row, team_row]

        with patch("app.routers.projects.crud.get", new_callable=AsyncMock, return_value=project):
            result = await post_project_update(
                project_id, ProjectUpdateCreate(update_text="Did the thing", hours_logged=3), mock_db, user,
            )
        assert result["message"] == "Update posted"

    @pytest.mark.asyncio
    async def test_employee_not_on_team_is_rejected(self):
        user = _make_user("developer")
        project_id = uuid.uuid4()
        employee = Employee(id=uuid.uuid4(), user_id=user.id, employee_code="EMP-2")
        project = Project(id=project_id, title="X", slug="x", status="planning", project_manager_id=uuid.uuid4(), **_project_defaults())

        mock_db = AsyncMock()
        emp_row = MagicMock(scalar_one_or_none=MagicMock(return_value=employee))
        not_a_member = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
        mock_db.execute.side_effect = [emp_row, not_a_member]

        with patch("app.routers.projects.crud.get", new_callable=AsyncMock, return_value=project):
            with pytest.raises(ApiError) as exc_info:
                await post_project_update(
                    project_id, ProjectUpdateCreate(update_text="sneaking in"), mock_db, user,
                )
        assert exc_info.value.status_code == 403


class TestProjectProposalLinkage:
    @pytest.mark.asyncio
    async def test_duplicate_project_for_same_proposal_returns_existing(self):
        proposal_id = uuid.uuid4()
        existing_project = Project(id=uuid.uuid4(), title="Existing", slug="existing", proposal_id=proposal_id, status="planning", client_id=None, **_project_defaults())

        mock_db = AsyncMock()
        found_existing = MagicMock(scalar_one_or_none=MagicMock(return_value=existing_project))
        # Second execute() re-fetches the existing project with team eager-loaded.
        reloaded = MagicMock(scalar_one=MagicMock(return_value=existing_project))
        mock_db.execute.side_effect = [found_existing, reloaded]

        mock_response = MagicMock(status_code=201)
        result = await create_project(
            ProjectCreate(title="Duplicate Attempt", proposal_id=proposal_id), mock_response, mock_db,
        )
        assert mock_response.status_code == 200
        assert result["message"] == "A project already exists for this proposal"
