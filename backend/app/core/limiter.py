from slowapi import Limiter

from app.core.config import settings
from app.core.dependencies import get_client_ip

# Shared limiter instance. Lives in its own module (rather than main.py) so
# routers can import `limiter` to decorate sensitive endpoints without
# creating a circular import with main.py (which mounts the routers).
#
# storage_uri MUST point at Redis in any multi-process deployment: slowapi's
# default in-memory storage is per-process, and this app runs 4 gunicorn
# workers (docker/Dockerfile) — with in-memory storage, "10/minute" on login
# was actually enforced independently per worker, i.e. up to ~40/minute in
# practice depending on load-balancer routing. Redis makes the counter shared
# and gives Redis (previously declared but unused) a real purpose.
limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[settings.rate_limit],
    storage_uri=settings.redis_url,
    # Rate limiting is defense-in-depth, not the primary authorization
    # boundary (every endpoint still enforces auth/RBAC independently) — if
    # Redis is unreachable, fail open rather than making the entire API
    # unavailable. Availability > strict rate limiting during a Redis outage.
    swallow_errors=True,
    # CF-BE-014: without this, slowapi's SlowAPIMiddleware calls the
    # *synchronous* `limits` Redis storage's `.check()` directly inside the
    # async request path on *every single request* — no thread offload — so
    # a hung Redis connection (DNS resolution + connect, both blocking calls)
    # blocks that worker's entire asyncio event loop, serializing all
    # concurrent requests on it. Confirmed via a live outage drill: 15
    # concurrent requests during a Redis outage took up to ~12s each.
    # `in_memory_fallback_enabled=True` makes slowapi mark storage "dead"
    # after the first failure (per worker process) and switch to slowapi's
    # own in-memory limiter for all subsequent requests, only periodically
    # re-probing the real backend (exponential backoff) instead of paying
    # the blocking cost on every request. Combined with docker-compose.yml's
    # `dns_opt` (which cuts the unavoidable first-failure DNS timeout from
    # ~4-8s to ~1s), this converts "every request blocks for seconds for the
    # entire outage" into "at most one ~1s hit per worker process, then fast
    # in-memory limiting until Redis recovers".
    in_memory_fallback_enabled=True,
)
