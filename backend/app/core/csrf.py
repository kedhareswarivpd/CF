"""CSRF protection for cookie-based auth.

Bearer-header auth is naturally immune to CSRF — a browser never
auto-attaches an Authorization header to a cross-site request. Cookies are
the opposite: a browser attaches them automatically to same-origin *and*
(depending on SameSite) some cross-site requests, which is exactly what lets
a malicious page trigger a state-changing request using the victim's own
session. `SameSite=Lax` (core/cookies.py) already blocks the classic
cross-site-form-POST case; this double-submit check is defense-in-depth on
top of that, and the actual enforcement for any state a browser's SameSite
handling doesn't cover.

Double-submit pattern: the CSRF cookie is set alongside the session cookies
at login (not httpOnly, so same-origin JS can read it) and must be echoed
back as a header on every state-changing request. A cross-site attacker can
make the browser *send* the cookie automatically, but cannot *read* it to
construct the matching header — only a script running on this app's own
origin can do that.
"""
import secrets

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.cookies import ACCESS_TOKEN_COOKIE, CSRF_COOKIE, CSRF_HEADER

_STATE_CHANGING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in _STATE_CHANGING_METHODS and request.cookies.get(ACCESS_TOKEN_COOKIE):
            # Only enforced once a session cookie exists — login/register are
            # unauthenticated POSTs with nothing to hijack yet (no session to
            # forge an action against), so they're naturally exempt here
            # rather than needing a route-by-route allowlist.
            cookie_token = request.cookies.get(CSRF_COOKIE)
            header_token = request.headers.get(CSRF_HEADER)
            if not cookie_token or not header_token or not secrets.compare_digest(cookie_token, header_token):
                return JSONResponse(
                    status_code=403,
                    content={"success": False, "status_code": 403, "message": "CSRF token missing or invalid", "errors": []},
                )
        return await call_next(request)
