"""
Set known, documented passwords on the standard demo accounts (the ones
seed_users.py creates) and write scripts/CREDENTIALS.local.md.

Unlike seed_users.py's own credentials sheet (only populated for accounts
freshly CREATED on that run), this script updates every demo account's
password to a known value regardless of whether it already existed —
useful when you've inherited a dev database where some demo accounts were
seeded on a previous run with since-forgotten random passwords, and you
want a complete, accurate, currently-correct credentials sheet.

Usage:
    cd backend
    python scripts/reset_demo_passwords.py

Refuses to run when ENV=production, same as seed_users.py.
"""
import asyncio
import os
import sys
from datetime import UTC, datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.database import AsyncSessionLocal  # noqa: E402
from app.core.password import hash_password  # noqa: E402
from app.models.user import User  # noqa: E402

# (email, role label, department, password) — the department mapping matches
# the (email, code, designation, dept) tuples in app/seeders/seed.py's run().
ACCOUNTS = [
    ("superadmin@corefusiontech.com", "Super Admin", "Management", "E2ESuperAdminPass123!"),
    ("admin@corefusiontech.com", "Admin", "Management", "E2EAdminPass123!"),
    ("john.doe@corefusiontech.com", "Employee", "Engineering", "E2EAdminPass123!"),
    ("sales@corefusiontech.com", "Sales", "Sales", "E2ESalesPass123!"),
    ("hr@corefusiontech.com", "HR", "Human Resources", "E2EHrPass123!"),
    ("marketing@corefusiontech.com", "Marketing", "Marketing", "E2EMarketingPass123!"),
    ("pm@corefusiontech.com", "Project Manager", "Management", "E2EPmPass123!"),
    ("developer@corefusiontech.com", "Developer", "Engineering", "E2EDeveloperPass123!"),
    ("qa@corefusiontech.com", "QA", "Quality Assurance", "E2EQaPass123!"),
    ("support@corefusiontech.com", "Support", "Customer Support", "E2ESupportPass123!"),
    ("finance@corefusiontech.com", "Finance", "Finance", "E2EFinancePass123!"),
]

OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "CREDENTIALS.local.md")


async def main():
    if settings.env.lower() in {"production", "prod"}:
        raise SystemExit("Refusing to reset demo passwords against ENV=production.")

    updated, missing = [], []
    async with AsyncSessionLocal() as db:
        for email, role, dept, password in ACCOUNTS:
            user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if not user:
                missing.append(email)
                continue
            user.password_hash = hash_password(password)
            updated.append((role, dept, email, password))
        await db.commit()

    if missing:
        print(f"Skipped {len(missing)} account(s) that don't exist yet (run seed_users.py first): {', '.join(missing)}")

    lines = [
        "# CoreFusion Demo Credentials",
        "",
        "**Generated locally by `scripts/reset_demo_passwords.py` — never commit this file.**",
        f"Generated at: {datetime.now(UTC).isoformat()}",
        "",
        "These are known, fixed passwords set directly on the demo accounts (not the",
        "random ones seed_users.py generates on first creation) — safe for local dev only.",
        "",
        "| Role | Department | Email | Password |",
        "|------|------------|-------|----------|",
    ]
    for role, dept, email, password in updated:
        lines.append(f"| {role} | {dept} | {email} | `{password}` |")
    lines.append("")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Reset {len(updated)} account password(s) and wrote {OUT_PATH} (gitignored, local-only).")


if __name__ == "__main__":
    asyncio.run(main())
