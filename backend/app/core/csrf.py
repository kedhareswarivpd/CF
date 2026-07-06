import hashlib
import hmac

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


def _derive_csrf_token(bearer_token: str) -> str:
    key = settings.supabase_jwt_secret or "csrf-fallback-key-change-in-production"
    return hmac.new(key.encode(), bearer_token.encode(), hashlib.sha256).hexdigest()


SKIP_CSRF_PATHS = {"/api/v1/auth/login", "/api/v1/auth/register"}

FRONTEND_ORIGINS = {"http://localhost:5173", "http://localhost:4173", "https://www.corefusiontech.com"}


class CsrfMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        referer = request.headers.get("referer", "")
        is_browser = any(origin.startswith(o) for o in FRONTEND_ORIGINS) or any(
            referer.startswith(o) for o in FRONTEND_ORIGINS
        )

        if not is_browser:
            return await call_next(request)

        if request.method in ("GET", "HEAD", "OPTIONS"):
            response = await call_next(request)
            auth = request.headers.get("authorization", "")
            if auth.startswith("Bearer "):
                response.headers["X-CSRF-Token"] = _derive_csrf_token(auth[7:])
            return response

        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            path = request.url.path
            if any(path.startswith(p) for p in SKIP_CSRF_PATHS):
                return await call_next(request)
            auth = request.headers.get("authorization", "")
            if auth.startswith("Bearer "):
                token = auth[7:]
                expected = _derive_csrf_token(token)
                actual = request.headers.get("x-csrf-token", "")
                if not actual or not hmac.compare_digest(expected, actual):
                    from fastapi.responses import JSONResponse

                    return JSONResponse(
                        status_code=403,
                        content={"success": False, "status_code": 403, "message": "CSRF validation failed"},
                    )

        return await call_next(request)
