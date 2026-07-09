from pathlib import Path

from app.core.config import Settings


def test_settings_read_dotenv_from_backend_root_when_cwd_changes(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_ANON_KEY", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)

    settings = Settings()

    assert settings.supabase_url.startswith("https://")
    assert settings.supabase_anon_key.startswith("ey")
    assert settings.supabase_service_role_key.startswith("ey")
