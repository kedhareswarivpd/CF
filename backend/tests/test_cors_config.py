from app.main import normalize_allowed_origins


def test_normalize_allowed_origins_removes_trailing_slashes_and_duplicates():
    origins = [
        "https://cf-azure-eta.vercel.app/",
        " https://cf-azure-eta.vercel.app ",
        "http://localhost:5173",
        "",
        "http://localhost:5173/",
        "https://www.corefusiontech.com",
        "https://www.corefusiontech.com/",
    ]

    assert normalize_allowed_origins(origins) == [
        "https://cf-azure-eta.vercel.app",
        "http://localhost:5173",
        "https://www.corefusiontech.com",
    ]
