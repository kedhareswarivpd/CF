"""
Thin wrapper around the `supabase-py` client.

Two clients are exposed:
- `get_anon_client()`  — uses the anon/public key. This is what should perform
  sign_in / sign_up / refresh / sign_out / password-reset calls, exactly like
  a browser or mobile client would, so Supabase's own rate limiting and email
  flows apply normally.
- `get_admin_client()` — uses the service-role key. This bypasses RLS and can
  create/update/delete auth users directly (`auth.admin.*`). Only used for
  backend-privileged operations (e.g. an admin creating a staff account, or
  the initial seed script).

Never expose the service-role key to a client application.
"""
from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings
from app.core.errors import ApiError


@lru_cache
def get_anon_client() -> Client:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise ApiError.internal("Supabase is not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing)")
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache
def get_admin_client() -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise ApiError.internal("Supabase admin client is not configured (SUPABASE_SERVICE_ROLE_KEY missing)")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
