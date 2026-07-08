import os
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.audit import log_audit
from app.core.config import settings
from app.core.errors import ApiError
from app.core.logger import logger
from app.core.security import decode_supabase_token
from app.core.sitemap import SITEMAP_ROUTES
from app.routers import api_router

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])

app = FastAPI(
    title=settings.app_name,
    description="CoreFusion Technologies — Website, Admin Panel, Client Portal & Employee Portal API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware is applied in reverse-registration order by Starlette:
# AuditMiddleware → SecurityHeadersMiddleware → CORSMiddleware (outermost last)
# CORS must be outermost so preflight OPTIONS responses are handled before any
# other middleware inspects the request.

_ALLOWED_ORIGINS = list({
    settings.client_url,
    settings.site_url,
    "http://localhost:5173",
    "http://localhost:4173",
})


# ---------- Security headers middleware ----------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


app.add_middleware(SecurityHeadersMiddleware)


# ---------- Audit middleware ----------
SKIP_AUDIT_PATHS = {"/health", "/docs", "/redoc", "/openapi.json", "/uploads"}


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return await call_next(request)

        path = request.url.path
        if any(path.startswith(p) for p in SKIP_AUDIT_PATHS):
            return await call_next(request)

        response = await call_next(request)

        if response.status_code < 200 or response.status_code >= 300:
            return response

        try:
            user_id = None
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
                try:
                    claims = await decode_supabase_token(token)
                    user_id = uuid.UUID(claims["sub"])
                except (ValueError, Exception):
                    pass

            entity_type = path.strip("/").split("/")[-2] if path.count("/") >= 2 else None
            entity_id = path.strip("/").split("/")[-1] if path.count("/") >= 2 else None
            try:
                entity_id = uuid.UUID(entity_id) if entity_id else None
            except (ValueError, TypeError):
                entity_id = None

            await log_audit(
                user_id=user_id,
                action=f"{request.method}_{path.strip('/').replace('/', '_')}",
                entity_type=entity_type,
                entity_id=entity_id,
                ip_address=request.headers.get("x-forwarded-for", request.client.host if request.client else None),
                user_agent=request.headers.get("user-agent"),
                log_metadata={"path": path, "query": str(request.query_params)},
            )
        except Exception as exc:
            logger.warning(f"Audit log failed: {exc}")

        return response


app.add_middleware(AuditMiddleware)

# CORSMiddleware is registered last so Starlette places it outermost —
# it runs first on every request, including OPTIONS preflight.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    expose_headers=["X-Request-Id"],
    max_age=600,
)


# ---------- Static file serving for uploaded assets ----------
upload_root = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.upload_dir)
os.makedirs(upload_root, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_root), name="uploads")


# ---------- Error handling ----------
@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    if exc.status_code >= 500:
        logger.error(f"{request.method} {request.url.path} - {exc.message}")
    else:
        logger.warning(f"{request.method} {request.url.path} - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "status_code": exc.status_code, "message": exc.message, "errors": exc.errors},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(p) for p in e["loc"]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"success": False, "status_code": 422, "message": "Validation failed", "errors": errors},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "status_code": 500, "message": "Internal Server Error"},
    )


# ---------- Health check ----------
@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": settings.app_name}


@app.get("/sitemap.xml", tags=["SEO"])
async def sitemap():
    from fastapi.responses import Response

    base_url = settings.site_url
    urls = "\n".join(
        f'  <url><loc>{base_url}{r["path"]}</loc><priority>{r["priority"]}</priority></url>'
        for r in SITEMAP_ROUTES
    )
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""
    return Response(content=xml.strip(), media_type="application/xml")


# ---------- API routes ----------
app.include_router(api_router, prefix=settings.api_prefix)
