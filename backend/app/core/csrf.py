# CSRF protection — threat model
#
# CSRF is intentionally mitigated by architecture rather than a middleware:
#
# 1. Authentication uses stateless JWT Bearer tokens
#    (`Authorization: Bearer <token>`) — never cookies. CSRF attacks rely on the
#    browser automatically attaching credentials (cookies) to cross-origin
#    requests; a third-party origin cannot set the `Authorization` header, so it
#    cannot forge an authenticated request.
#
# 2. The frontend stores the token in `sessionStorage` (see `lib/supabase.js`)
#    and sends it explicitly via the Authorization header.
#
# 3. CORS is configured with an explicit allowlist of origins and
#    `allow_credentials=True` (required for Supabase auth flows). Only the
#    configured origins are permitted to read responses.
#
# This model is ONLY safe while:
#   - tokens stay out of cookies, AND
#   - the same-origin policy + the CORS allowlist are enforced.
#
# If cookie-based auth is ever introduced, a synchronizer-token or
# double-submit-cookie CSRF defense (or a SameSite=Strict/Lax cookie) MUST be
# added before shipping.
#
# Reference: OWASP Cross-Site Request Forgery Prevention Cheat Sheet
#   https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
#   Sections: "Verifying Origin With Standard Headers" and
#   "Use of Custom Request Headers"
