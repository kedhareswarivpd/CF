import asyncio
import json
import os
import random
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.password import hash_password
from app.models.analytics import PageView
from app.models.department import Department
from app.models.employee import Employee
from app.models.setting import Setting
from app.models.user import User

# Seed passwords are generated fresh on every run (never hardcoded/guessable)
# and written once to a local, gitignored file — never printed to stdout,
# which may end up in CI logs. See CF-AUD-007.
_CREDENTIALS_OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".seed_credentials.local.json")
_generated_credentials: dict[str, str] = {}


def _seed_password(email_env_override: str) -> str:
    """Use an explicit env override if provided (e.g. for CI fixtures),
    otherwise generate a fresh random password for this seed run."""
    override = os.environ.get(email_env_override)
    return override if override else secrets.token_urlsafe(16)


SUPER_ADMIN_EMAIL = "superadmin@corefusiontech.com"
SUPER_ADMIN_PASSWORD = _seed_password("SEED_SUPER_ADMIN_PASSWORD")

ADMIN_EMAIL = "admin@corefusiontech.com"
ADMIN_PASSWORD = _seed_password("SEED_ADMIN_PASSWORD")

EMPLOYEE_EMAIL = "john.doe@corefusiontech.com"
EMPLOYEE_PASSWORD = _seed_password("SEED_EMPLOYEE_PASSWORD")

SALES_EMAIL = "sales@corefusiontech.com"
SALES_PASSWORD = _seed_password("SEED_SALES_PASSWORD")

HR_EMAIL = "hr@corefusiontech.com"
HR_PASSWORD = _seed_password("SEED_HR_PASSWORD")

MARKETING_EMAIL = "marketing@corefusiontech.com"
MARKETING_PASSWORD = _seed_password("SEED_MARKETING_PASSWORD")

PM_EMAIL = "pm@corefusiontech.com"
PM_PASSWORD = _seed_password("SEED_PM_PASSWORD")

DEVELOPER_EMAIL = "developer@corefusiontech.com"
DEVELOPER_PASSWORD = _seed_password("SEED_DEVELOPER_PASSWORD")

QA_EMAIL = "qa@corefusiontech.com"
QA_PASSWORD = _seed_password("SEED_QA_PASSWORD")

SUPPORT_EMAIL = "support@corefusiontech.com"
SUPPORT_PASSWORD = _seed_password("SEED_SUPPORT_PASSWORD")

FINANCE_EMAIL = "finance@corefusiontech.com"
FINANCE_PASSWORD = _seed_password("SEED_FINANCE_PASSWORD")


async def seed_super_admin(db):
    existing = (await db.execute(select(User).where(User.email == SUPER_ADMIN_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Super admin already exists")
        return

    admin = User(
        id=uuid.uuid4(),
        password_hash=hash_password(SUPER_ADMIN_PASSWORD),
        name="CoreFusion Super Admin",
        email=SUPER_ADMIN_EMAIL,
        role="super_admin",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(admin)
    _generated_credentials[SUPER_ADMIN_EMAIL] = SUPER_ADMIN_PASSWORD
    print(f"Super admin created: {SUPER_ADMIN_EMAIL}")


async def seed_admin(db):
    existing = (await db.execute(select(User).where(User.email == ADMIN_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Admin already exists")
        return

    admin = User(
        id=uuid.uuid4(),
        password_hash=hash_password(ADMIN_PASSWORD),
        name="CoreFusion Admin",
        email=ADMIN_EMAIL,
        role="admin",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(admin)
    _generated_credentials[ADMIN_EMAIL] = ADMIN_PASSWORD
    print(f"Admin created: {ADMIN_EMAIL}")


async def seed_employee(db):
    existing = (await db.execute(select(User).where(User.email == EMPLOYEE_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Employee already exists")
        return

    employee = User(
        id=uuid.uuid4(),
        password_hash=hash_password(EMPLOYEE_PASSWORD),
        name="John Doe",
        email=EMPLOYEE_EMAIL,
        role="employee",
        phone="+91-98765-43210",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(employee)
    _generated_credentials[EMPLOYEE_EMAIL] = EMPLOYEE_PASSWORD
    print(f"Employee created: {EMPLOYEE_EMAIL}")


async def seed_sales(db):
    existing = (await db.execute(select(User).where(User.email == SALES_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Sales user already exists")
        return

    sales = User(
        id=uuid.uuid4(),
        password_hash=hash_password(SALES_PASSWORD),
        name="Sales Representative",
        email=SALES_EMAIL,
        role="sales",
        phone="+91-98765-43211",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(sales)
    _generated_credentials[SALES_EMAIL] = SALES_PASSWORD
    print(f"Sales user created: {SALES_EMAIL}")


async def seed_hr(db):
    existing = (await db.execute(select(User).where(User.email == HR_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  HR user already exists")
        return

    hr = User(
        id=uuid.uuid4(),
        password_hash=hash_password(HR_PASSWORD),
        name="HR Manager",
        email=HR_EMAIL,
        role="hr",
        phone="+91-98765-43212",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(hr)
    _generated_credentials[HR_EMAIL] = HR_PASSWORD
    print(f"HR user created: {HR_EMAIL}")


async def seed_marketing(db):
    existing = (await db.execute(select(User).where(User.email == MARKETING_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Marketing user already exists")
        return

    user = User(
        id=uuid.uuid4(),
        password_hash=hash_password(MARKETING_PASSWORD),
        name="Marketing Manager",
        email=MARKETING_EMAIL,
        role="marketing",
        phone="+91-98765-43213",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    _generated_credentials[MARKETING_EMAIL] = MARKETING_PASSWORD
    print(f"Marketing user created: {MARKETING_EMAIL}")


async def seed_project_manager(db):
    existing = (await db.execute(select(User).where(User.email == PM_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Project Manager user already exists")
        return

    user = User(
        id=uuid.uuid4(),
        password_hash=hash_password(PM_PASSWORD),
        name="Project Manager",
        email=PM_EMAIL,
        role="project_manager",
        phone="+91-98765-43214",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    _generated_credentials[PM_EMAIL] = PM_PASSWORD
    print(f"Project Manager user created: {PM_EMAIL}")


async def seed_developer(db):
    existing = (await db.execute(select(User).where(User.email == DEVELOPER_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Developer user already exists")
        return

    user = User(
        id=uuid.uuid4(),
        password_hash=hash_password(DEVELOPER_PASSWORD),
        name="Developer",
        email=DEVELOPER_EMAIL,
        role="developer",
        phone="+91-98765-43215",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    _generated_credentials[DEVELOPER_EMAIL] = DEVELOPER_PASSWORD
    print(f"Developer user created: {DEVELOPER_EMAIL}")


async def seed_qa(db):
    existing = (await db.execute(select(User).where(User.email == QA_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  QA user already exists")
        return

    user = User(
        id=uuid.uuid4(),
        password_hash=hash_password(QA_PASSWORD),
        name="QA Engineer",
        email=QA_EMAIL,
        role="qa",
        phone="+91-98765-43216",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    _generated_credentials[QA_EMAIL] = QA_PASSWORD
    print(f"QA user created: {QA_EMAIL}")


async def seed_support(db):
    existing = (await db.execute(select(User).where(User.email == SUPPORT_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Support user already exists")
        return

    user = User(
        id=uuid.uuid4(),
        password_hash=hash_password(SUPPORT_PASSWORD),
        name="Support Engineer",
        email=SUPPORT_EMAIL,
        role="support",
        phone="+91-98765-43217",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    _generated_credentials[SUPPORT_EMAIL] = SUPPORT_PASSWORD
    print(f"Support user created: {SUPPORT_EMAIL}")


async def seed_finance(db):
    existing = (await db.execute(select(User).where(User.email == FINANCE_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Finance user already exists")
        return

    user = User(
        id=uuid.uuid4(),
        password_hash=hash_password(FINANCE_PASSWORD),
        name="Finance Manager",
        email=FINANCE_EMAIL,
        role="finance",
        phone="+91-98765-43218",
        is_active=True,
        is_email_verified=True,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    _generated_credentials[FINANCE_EMAIL] = FINANCE_PASSWORD
    print(f"Finance user created: {FINANCE_EMAIL}")


async def run():
    if settings.env.lower() in {"production", "prod"}:
        raise SystemExit(
            "Refusing to run the demo seed script against ENV=production. "
            "This creates known-role demo accounts and is for local/dev/staging only."
        )

    async with AsyncSessionLocal() as db:
        await seed_super_admin(db)
        await seed_admin(db)
        await seed_employee(db)
        await seed_sales(db)
        await seed_hr(db)
        await seed_marketing(db)
        await seed_project_manager(db)
        await seed_developer(db)
        await seed_qa(db)
        await seed_support(db)
        await seed_finance(db)

        departments = [
            "Engineering", "Design", "Sales", "Marketing", "Human Resources",
            "Finance", "Quality Assurance", "DevOps", "Customer Support", "Management",
        ]
        dept_map = {}
        for name in departments:
            exists = (await db.execute(select(Department).where(Department.name == name))).scalar_one_or_none()
            if not exists:
                dept = Department(name=name)
                db.add(dept)
                await db.flush()
                dept_map[name] = dept.id
            else:
                dept_map[name] = exists.id
        print("Departments seeded")

        # Seed Employee records for employee/sales users so self-service endpoints work
        for email, emp_code, designation, dept_name in [
            (EMPLOYEE_EMAIL, "EMP-001", "Software Engineer", "Engineering"),
            (SALES_EMAIL, "EMP-002", "Sales Executive", "Sales"),
            (HR_EMAIL, "EMP-003", "HR Manager", "Human Resources"),
            (MARKETING_EMAIL, "EMP-004", "Marketing Manager", "Marketing"),
            (PM_EMAIL, "EMP-005", "Project Manager", "Management"),
            (DEVELOPER_EMAIL, "EMP-006", "Software Developer", "Engineering"),
            (QA_EMAIL, "EMP-007", "QA Engineer", "Quality Assurance"),
            (SUPPORT_EMAIL, "EMP-008", "Support Engineer", "Customer Support"),
            (FINANCE_EMAIL, "EMP-009", "Finance Manager", "Finance"),
        ]:
            user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if not user:
                continue
            existing_emp = (await db.execute(select(Employee).where(Employee.user_id == user.id))).scalar_one_or_none()
            if existing_emp:
                print(f"  Employee record already exists for {email}")
                continue
            emp = Employee(
                user_id=user.id,
                employee_code=emp_code,
                department_id=dept_map.get(dept_name),
                designation=designation,
                status="active",
                employment_type="full_time",
            )
            db.add(emp)
            print(f"  Employee record created for {email}")

        settings_data = [
            ("site.title", "CoreFusion Technologies", "public"),
            ("site.tagline", "Transforming Businesses Through Intelligent Digital Solutions", "public"),
            ("contact.email", "info@corefusiontech.com", "public"),
            ("contact.phone", "+91-11-0000-0000", "public"),
            ("social.linkedin", "https://linkedin.com/company/corefusiontech", "public"),
        ]
        for key, value, group in settings_data:
            exists = (await db.execute(select(Setting).where(Setting.key == key))).scalar_one_or_none()
            if not exists:
                db.add(Setting(key=key, value=value, group=group))
        print("Default settings seeded")

        existing_views = (await db.execute(select(PageView.id).limit(1))).scalar_one_or_none()
        if not existing_views:
            paths = [
                "/", "/services", "/about", "/portfolio", "/contact",
                "/careers", "/blog", "/solutions", "/products",
                "/technologies", "/industries", "/case-studies",
                "/downloads", "/resources", "/events", "/gallery",
                "/awards", "/faq", "/privacy", "/terms",
                "/login", "/admin", "/client",
            ]
            agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/17.4",
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148",
                "Mozilla/5.0 (Linux; Android 14) Chrome/125.0 Mobile",
            ]
            now = datetime.utcnow()
            views = []
            for _ in range(200):
                days_ago = random.randint(0, 30)
                hours_ago = random.randint(0, 23)
                views.append(PageView(
                    path=random.choice(paths),
                    ip_address=f"{random.randint(10,220)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                    user_agent=random.choice(agents),
                    viewed_at=now - timedelta(days=days_ago, hours=hours_ago),
                ))
            db.add_all(views)
            print(f"Seeded {len(views)} page views")

        await db.commit()

        if _generated_credentials:
            with open(_CREDENTIALS_OUT, "w", encoding="utf-8") as f:
                json.dump(_generated_credentials, f, indent=2)
            print(
                f"\n{len(_generated_credentials)} new demo account password(s) written to "
                f"{_CREDENTIALS_OUT} (gitignored, local-only). Rotate/delete before going to production."
            )

        print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(run())
