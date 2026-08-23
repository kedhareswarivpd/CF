"""
Seed demo users, departments, and reference content, then write a
human-readable credentials sheet to scripts/CREDENTIALS.local.md.

This is a thin wrapper around the actual seeding logic in
app/seeders/seed.py (single source of truth for what gets created —
this script does not duplicate it). It exists so the "create users" /
"seed data" workflow has a discoverable entry point under scripts/,
and so a plaintext credentials sheet is produced for local dev without
those passwords ever being committed to git.

Usage (from the backend/ directory, with the venv active and the
database reachable — e.g. `docker compose up -d postgres` first):

    python scripts/seed_users.py

Safe to re-run: existing accounts/departments are left untouched, and
the credentials sheet only lists accounts that were actually created
on THIS run. If every account already exists, no new sheet is written
and the script says so.
"""
import asyncio
import os
import sys
from datetime import UTC, datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.seeders import seed  # noqa: E402

# email -> department, kept in sync with the (email, code, designation, dept)
# tuples in app/seeders/seed.py's run() — this is display metadata for the
# credentials sheet, not seeding logic, so duplicating just the department
# name here (rather than importing internals of run()) is the simpler option.
EMAIL_DEPARTMENT = {
    seed.SUPER_ADMIN_EMAIL: "Management",
    seed.ADMIN_EMAIL: "Management",
    seed.EMPLOYEE_EMAIL: "Engineering",
    seed.SALES_EMAIL: "Sales",
    seed.HR_EMAIL: "Human Resources",
    seed.MARKETING_EMAIL: "Marketing",
    seed.PM_EMAIL: "Management",
    seed.DEVELOPER_EMAIL: "Engineering",
    seed.QA_EMAIL: "Quality Assurance",
    seed.SUPPORT_EMAIL: "Customer Support",
    seed.FINANCE_EMAIL: "Finance",
}

ALL_DEPARTMENTS = [
    "Engineering", "Design", "Sales", "Marketing", "Human Resources",
    "Finance", "Quality Assurance", "DevOps", "Customer Support", "Management",
]

OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "CREDENTIALS.local.md")


def write_credentials_md(generated: dict[str, str]) -> None:
    if not generated:
        print("No new accounts were created this run — CREDENTIALS.local.md not touched.")
        return

    rows = []
    for email, password in generated.items():
        role = next((r for r, e in seed.__dict__.items() if e == email and r.endswith("_EMAIL")), None)
        role_label = (role or "").removesuffix("_EMAIL").replace("_", " ").title() or "—"
        dept = EMAIL_DEPARTMENT.get(email, "—")
        rows.append((role_label, dept, email, password))

    lines = [
        "# CoreFusion Demo Credentials",
        "",
        "**Generated locally by `scripts/seed_users.py` — never commit this file.**",
        f"Generated at: {datetime.now(UTC).isoformat()}",
        "",
        "Passwords are randomly generated on each seed run (see `app/seeders/seed.py`).",
        "Only accounts created on the run that produced this file are listed. If an",
        "account already existed, its original password is whatever was captured the",
        "first time it was seeded — check for an earlier copy of this file if you kept one.",
        "",
        "| Role | Department | Email | Password |",
        "|------|------------|-------|----------|",
    ]
    for role_label, dept, email, password in rows:
        lines.append(f"| {role_label} | {dept} | {email} | `{password}` |")

    lines += [
        "",
        "## Departments seeded",
        "",
        *[f"- {d}" for d in ALL_DEPARTMENTS],
        "",
    ]

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Wrote {len(rows)} account(s) to {OUT_PATH} (gitignored, local-only).")


async def main():
    await seed.run()
    write_credentials_md(seed._generated_credentials)


if __name__ == "__main__":
    asyncio.run(main())
