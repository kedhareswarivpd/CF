import asyncio
from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

# Patch create_async_engine at the source BEFORE any app module is imported
# This prevents the engine from trying to connect to a real PostgreSQL database
source_patcher = patch("sqlalchemy.ext.asyncio.create_async_engine", return_value=MagicMock())
source_patcher.start()

# Patch supabase client creation
supabase_patcher = patch("app.services.supabase_client.create_client", return_value=MagicMock())
supabase_patcher.start()

from app.main import app  # noqa: E402


@pytest.fixture
def test_app():
    return app


@pytest.fixture
async def async_client(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
