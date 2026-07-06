import pytest


class TestServicesPublic:
    """Tests for public services endpoints — validation layer only (no real DB)."""

    async def test_list_services_pagination_validation(self, async_client):
        response = await async_client.get("/api/v1/services?page=0")
        assert response.status_code == 422

    async def test_list_services_bad_limit(self, async_client):
        response = await async_client.get("/api/v1/services?limit=0")
        assert response.status_code == 422

    async def test_create_service_requires_auth(self, async_client):
        response = await async_client.post(
            "/api/v1/services",
            json={"name": "Test Service"},
        )
        assert response.status_code == 401

    async def test_create_service_with_invalid_token(self, async_client):
        response = await async_client.post(
            "/api/v1/services",
            json={"name": "Test Service"},
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401

    async def test_update_service_requires_auth(self, async_client):
        response = await async_client.put(
            "/api/v1/services/00000000-0000-0000-0000-000000000000",
            json={"name": "Updated"},
        )
        assert response.status_code in (401, 404)

    async def test_delete_service_requires_auth(self, async_client):
        response = await async_client.delete(
            "/api/v1/services/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code in (401, 404)

    async def test_get_service_blank_id_redirects(self, async_client):
        response = await async_client.get("/api/v1/services/", follow_redirects=False)
        assert response.status_code == 307
