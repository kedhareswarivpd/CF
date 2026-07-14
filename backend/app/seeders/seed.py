import asyncio
import uuid

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.department import Department
from app.models.setting import Setting
from app.models.user import User
from app.services.supabase_client import get_admin_client

SUPER_ADMIN_EMAIL = "admin@corefusiontech.com"
SUPER_ADMIN_PASSWORD = "ChangeMe@123"

EMPLOYEE_EMAIL = "john.doe@corefusiontech.com"
EMPLOYEE_PASSWORD = "Employee@123"

SALES_EMAIL = "sales@corefusiontech.com"
SALES_PASSWORD = "Sales@123"


async def seed_super_admin(db):
    existing = (await db.execute(select(User).where(User.email == SUPER_ADMIN_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Super admin already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "CoreFusion Super Admin"},
        }
    )

    admin = User(
        id=uuid.UUID(auth_response.user.id),
        name="CoreFusion Super Admin",
        email=SUPER_ADMIN_EMAIL,
        role="super_admin",
        is_active=True,
        is_email_verified=True,
    )
    db.add(admin)
    print(f"Super admin created in Supabase + local profile: {SUPER_ADMIN_EMAIL} / {SUPER_ADMIN_PASSWORD}")


async def seed_employee(db):
    existing = (await db.execute(select(User).where(User.email == EMPLOYEE_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Employee already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "John Doe"},
        }
    )

    employee = User(
        id=uuid.UUID(auth_response.user.id),
        name="John Doe",
        email=EMPLOYEE_EMAIL,
        role="employee",
        phone="+91-98765-43210",
        is_active=True,
        is_email_verified=True,
    )
    db.add(employee)
    print(f"Employee created: {EMPLOYEE_EMAIL} / {EMPLOYEE_PASSWORD}")


async def seed_sales(db):
    existing = (await db.execute(select(User).where(User.email == SALES_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Sales user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": SALES_EMAIL,
            "password": SALES_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "Sales Representative"},
        }
    )

    sales = User(
        id=uuid.UUID(auth_response.user.id),
        name="Sales Representative",
        email=SALES_EMAIL,
        role="sales",
        phone="+91-98765-43211",
        is_active=True,
        is_email_verified=True,
    )
    db.add(sales)
    print(f"Sales user created: {SALES_EMAIL} / {SALES_PASSWORD}")


async def run():
    async with AsyncSessionLocal() as db:
        await seed_super_admin(db)
        await seed_employee(db)
        await seed_sales(db)

        departments = [
            "Engineering", "Design", "Sales", "Marketing", "Human Resources",
            "Finance", "Quality Assurance", "DevOps", "Customer Support", "Management",
        ]
        for name in departments:
            exists = (await db.execute(select(Department).where(Department.name == name))).scalar_one_or_none()
            if not exists:
                db.add(Department(name=name))
        print("Departments seeded")

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

        await db.commit()
        print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(run())
