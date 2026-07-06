"""Tests for Phase 2 endpoints — products, solutions, resources, newsletter, etc."""


class TestProducts:
    async def test_list_products_returns_200(self, async_client):
        response = await async_client.get("/api/v1/products")
        assert response.status_code == 200
        assert response.json()["success"] is True

    async def test_create_product_requires_auth(self, async_client):
        response = await async_client.post("/api/v1/products", json={"name": "Test Product"})
        assert response.status_code == 401

    async def test_get_product_by_id_returns_404_for_missing(self, async_client):
        response = await async_client.get("/api/v1/products/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404

    async def test_create_product_with_invalid_token(self, async_client):
        response = await async_client.post(
            "/api/v1/products",
            json={"name": "Test"},
            headers={"Authorization": "Bearer invalid"},
        )
        assert response.status_code == 401


class TestSolutions:
    async def test_list_solutions_returns_200(self, async_client):
        response = await async_client.get("/api/v1/solutions")
        assert response.status_code == 200

    async def test_create_solution_requires_auth(self, async_client):
        response = await async_client.post("/api/v1/solutions", json={"name": "Test Solution"})
        assert response.status_code == 401


class TestResources:
    async def test_list_resources_returns_200(self, async_client):
        response = await async_client.get("/api/v1/resources")
        assert response.status_code == 200

    async def test_create_resource_requires_auth(self, async_client):
        response = await async_client.post("/api/v1/resources", json={"title": "Test Resource"})
        assert response.status_code == 401


class TestNewsletter:
    async def test_subscribe_validation(self, async_client):
        response = await async_client.post("/api/v1/newsletter/subscribe", json={"email": "not-an-email"})
        assert response.status_code == 422

    async def test_subscribe_requires_email(self, async_client):
        response = await async_client.post("/api/v1/newsletter/subscribe", json={})
        assert response.status_code == 422

    async def test_list_subscribers_requires_auth(self, async_client):
        response = await async_client.get("/api/v1/newsletter/subscribers")
        assert response.status_code == 401


class TestSEO:
    async def test_get_seo_returns_null_for_unknown(self, async_client):
        response = await async_client.get("/api/v1/seo/nonexistent-path")
        assert response.status_code == 200
        data = response.json()
        assert data["data"] is None

    async def test_upsert_seo_requires_auth(self, async_client):
        response = await async_client.put("/api/v1/seo/test-path", json={"title": "Test Title"})
        assert response.status_code == 401


class TestPageContent:
    async def test_get_page_returns_404_for_missing(self, async_client):
        response = await async_client.get("/api/v1/pages/nonexistent")
        assert response.status_code == 404

    async def test_upsert_page_requires_auth(self, async_client):
        response = await async_client.put("/api/v1/pages/privacy", json={"title": "Privacy Policy"})
        assert response.status_code == 401


class TestTraining:
    async def test_list_courses_returns_200(self, async_client):
        response = await async_client.get("/api/v1/trainings/courses")
        assert response.status_code == 200

    async def test_create_course_requires_auth(self, async_client):
        response = await async_client.post("/api/v1/trainings/courses", json={"title": "Test Course"})
        assert response.status_code == 401


class TestPerformanceReviews:
    async def test_list_reviews_requires_auth(self, async_client):
        response = await async_client.get("/api/v1/performance-reviews")
        assert response.status_code == 401


class TestAnalytics:
    async def test_track_page_view_returns_200(self, async_client):
        response = await async_client.post("/api/v1/analytics/track", json={"path": "/test"})
        assert response.status_code == 200

    async def test_summary_requires_auth(self, async_client):
        response = await async_client.get("/api/v1/analytics/summary")
        assert response.status_code == 401


class TestSitemap:
    async def test_sitemap_returns_xml(self, async_client):
        response = await async_client.get("/sitemap.xml")
        assert response.status_code == 200
        assert "urlset" in response.text
