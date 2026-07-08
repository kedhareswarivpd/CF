# CSRF middleware intentionally removed.
#
# This application uses stateless JWT Bearer token authentication
# (Authorization: Bearer <token>). CSRF attacks require the browser to
# automatically attach credentials (cookies) to cross-origin requests.
# Because auth lives in the Authorization header — which JavaScript on a
# third-party origin cannot set — CSRF is not a threat to this architecture.
#
# Reference: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
#            Section: "Verifying Origin With Standard Headers" and
#            "Use of Custom Request Headers"
