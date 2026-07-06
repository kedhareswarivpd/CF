import pytest


class TestProjectsPublic:
    """Tests for projects endpoints — validation layer only (no real DB)."""

    async def test_create_project_requires_auth(self, async_client):
        response = await async_client.post(
            "/api/v1/projects",
            json={"title": "Test Project"},
        )
        assert response.status_code == 401

    async def test_update_project_requires_auth(self, async_client):
        response = await async_client.put(
            "/api/v1/projects/00000000-0000-0000-0000-000000000000",
            json={"title": "Updated"},
        )
        assert response.status_code == 401

    async def test_delete_project_requires_auth(self, async_client):
        response = await async_client.delete(
            "/api/v1/projects/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 401

    async def test_list_projects_bad_page_params(self, async_client):
        response = await async_client.get("/api/v1/projects?page=0")
        assert response.status_code == 422

    async def test_get_project_blank_id_redirects(self, async_client):
        response = await async_client.get("/api/v1/projects/", follow_redirects=False)
        assert response.status_code == 307
