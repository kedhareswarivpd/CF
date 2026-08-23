
from app.core.config import Settings


def test_settings_read_dotenv_from_backend_root_when_cwd_changes(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("DB_NAME", raising=False)
    monkeypatch.delenv("DB_USER", raising=False)

    settings = Settings()

    # backend/.env sets these to non-default values ("corefusion", not the
    # Settings class defaults "postgres") — if this ever changes, use any
    # other backend/.env value that differs from its Settings class default.
    assert settings.db_name != "postgres"
    assert settings.db_user != "postgres"
