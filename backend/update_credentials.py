"""
Update admin/superadmin credentials in the database and Supabase Auth.

- Changes existing admin@corefusiontech.com (currently super_admin) to role=admin
  and updates its Supabase password.
- Creates superadmin@corefusiontech.com with role=super_admin if it doesn't already exist.

Passwords are read from the SUPERVISOR/ADMIN_CREDENTIALS env vars or prompted interactively.
"""
import asyncio
import os
import uuid
from getpass import getpass

from sqlalchemy import select, update
from starlette.concurrency import run_in_threadpool

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.services.supabase_client import get_admin_client

SUPER_ADMIN_EMAIL = "superadmin@corefusiontech.com"
ADMIN_EMAIL = "admin@corefusiontech.com"

SUPER_ADMIN_PASSWORD = os.environ.get("SUPER_ADMIN_PASSWORD") or getpass(f"Password for {SUPER_ADMIN_EMAIL}: ")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") or getpass(f"Password for {ADMIN_EMAIL}: ")


async def main():
    admin_client = get_admin_client()

    async with AsyncSessionLocal() as db:
        # 1. Update existing admin@corefusiontech.com -> role=admin + new password
        existing_admin = (await db.execute(select(User).where(User.email == ADMIN_EMAIL))).scalar_one_or_none()
        if existing_admin:
            # Update Supabase password
            try:
                await run_in_threadpool(
                    admin_client.auth.admin.update_user_by_id,
                    str(existing_admin.id),
                    {"password": ADMIN_PASSWORD},
                )
                print(f"[OK] Updated Supabase password for {ADMIN_EMAIL}")
            except Exception as exc:
                print(f"[WARN] Could not update Supabase password for {ADMIN_EMAIL}: {exc}")

            # Update local role and name
            if existing_admin.role != "admin" or existing_admin.name != "CoreFusion Admin":
                await db.execute(
                    update(User).where(User.id == existing_admin.id).values(role="admin", name="CoreFusion Admin")
                )
                await db.commit()
                print(f"[OK] Updated {ADMIN_EMAIL} role -> admin, name -> CoreFusion Admin")
            else:
                print(f"[OK] {ADMIN_EMAIL} already has role=admin")
        else:
            print(f"[INFO] {ADMIN_EMAIL} not found in local DB — will be created by seed script")

        # 2. Create superadmin@corefusiontech.com if it doesn't exist
        existing_super = (await db.execute(select(User).where(User.email == SUPER_ADMIN_EMAIL))).scalar_one_or_none()
        if existing_super:
            print(f"[OK] {SUPER_ADMIN_EMAIL} already exists")
        else:
            try:
                auth_response = await run_in_threadpool(
                    admin_client.auth.admin.create_user,
                    {
                        "email": SUPER_ADMIN_EMAIL,
                        "password": SUPER_ADMIN_PASSWORD,
                        "email_confirm": True,
                        "user_metadata": {"name": "CoreFusion Super Admin"},
                    },
                )
                super_admin = User(
                    id=uuid.UUID(auth_response.user.id),
                    name="CoreFusion Super Admin",
                    email=SUPER_ADMIN_EMAIL,
                    role="super_admin",
                    is_active=True,
                    is_email_verified=True,
                )
                db.add(super_admin)
                await db.commit()
                print(f"[OK] Created {SUPER_ADMIN_EMAIL} with role=super_admin")
            except Exception as exc:
                print(f"[ERROR] Could not create {SUPER_ADMIN_EMAIL}: {exc}")

        # 3. Verify final state
        print("\n=== Final user state ===")
        for email in (ADMIN_EMAIL, SUPER_ADMIN_EMAIL):
            user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if user:
                print(f"  {user.email}  role={user.role}  name={user.name}")
            else:
                print(f"  {email}  NOT FOUND")


if __name__ == "__main__":
    asyncio.run(main())