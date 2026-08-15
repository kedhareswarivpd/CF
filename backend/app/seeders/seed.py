import asyncio
import uuid

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.department import Department
from app.models.employee import Employee
from app.models.setting import Setting
from app.models.user import User
from app.services.supabase_client import get_admin_client

SUPER_ADMIN_EMAIL = "superadmin@corefusiontech.com"
SUPER_ADMIN_PASSWORD = "SuperAdmin@123"

ADMIN_EMAIL = "admin@corefusiontech.com"
ADMIN_PASSWORD = "Admin@123"

EMPLOYEE_EMAIL = "john.doe@corefusiontech.com"
EMPLOYEE_PASSWORD = "Employee@123"

SALES_EMAIL = "sales@corefusiontech.com"
SALES_PASSWORD = "Sales@123"

HR_EMAIL = "hr@corefusiontech.com"
HR_PASSWORD = "Hr@123"

MARKETING_EMAIL = "marketing@corefusiontech.com"
MARKETING_PASSWORD = "Marketing@123"

PM_EMAIL = "pm@corefusiontech.com"
PM_PASSWORD = "ProjectManager@123"

DEVELOPER_EMAIL = "developer@corefusiontech.com"
DEVELOPER_PASSWORD = "Developer@123"

QA_EMAIL = "qa@corefusiontech.com"
QA_PASSWORD = "Qa@123"

SUPPORT_EMAIL = "support@corefusiontech.com"
SUPPORT_PASSWORD = "Support@123"

FINANCE_EMAIL = "finance@corefusiontech.com"
FINANCE_PASSWORD = "Finance@123"


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


async def seed_admin(db):
    existing = (await db.execute(select(User).where(User.email == ADMIN_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Admin already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "CoreFusion Admin"},
        }
    )

    admin = User(
        id=uuid.UUID(auth_response.user.id),
        name="CoreFusion Admin",
        email=ADMIN_EMAIL,
        role="admin",
        is_active=True,
        is_email_verified=True,
    )
    db.add(admin)
    print(f"Admin created in Supabase + local profile: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")


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


async def seed_hr(db):
    existing = (await db.execute(select(User).where(User.email == HR_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  HR user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": HR_EMAIL,
            "password": HR_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "HR Manager"},
        }
    )

    hr = User(
        id=uuid.UUID(auth_response.user.id),
        name="HR Manager",
        email=HR_EMAIL,
        role="hr",
        phone="+91-98765-43212",
        is_active=True,
        is_email_verified=True,
    )
    db.add(hr)
    print(f"HR user created: {HR_EMAIL} / {HR_PASSWORD}")


async def seed_marketing(db):
    existing = (await db.execute(select(User).where(User.email == MARKETING_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Marketing user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": MARKETING_EMAIL,
            "password": MARKETING_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "Marketing Manager"},
        }
    )

    user = User(
        id=uuid.UUID(auth_response.user.id),
        name="Marketing Manager",
        email=MARKETING_EMAIL,
        role="marketing",
        phone="+91-98765-43213",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    print(f"Marketing user created: {MARKETING_EMAIL} / {MARKETING_PASSWORD}")


async def seed_project_manager(db):
    existing = (await db.execute(select(User).where(User.email == PM_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Project Manager user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": PM_EMAIL,
            "password": PM_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "Project Manager"},
        }
    )

    user = User(
        id=uuid.UUID(auth_response.user.id),
        name="Project Manager",
        email=PM_EMAIL,
        role="project_manager",
        phone="+91-98765-43214",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    print(f"Project Manager user created: {PM_EMAIL} / {PM_PASSWORD}")


async def seed_developer(db):
    existing = (await db.execute(select(User).where(User.email == DEVELOPER_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Developer user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": DEVELOPER_EMAIL,
            "password": DEVELOPER_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "Developer"},
        }
    )

    user = User(
        id=uuid.UUID(auth_response.user.id),
        name="Developer",
        email=DEVELOPER_EMAIL,
        role="developer",
        phone="+91-98765-43215",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    print(f"Developer user created: {DEVELOPER_EMAIL} / {DEVELOPER_PASSWORD}")


async def seed_qa(db):
    existing = (await db.execute(select(User).where(User.email == QA_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  QA user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": QA_EMAIL,
            "password": QA_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "QA Engineer"},
        }
    )

    user = User(
        id=uuid.UUID(auth_response.user.id),
        name="QA Engineer",
        email=QA_EMAIL,
        role="qa",
        phone="+91-98765-43216",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    print(f"QA user created: {QA_EMAIL} / {QA_PASSWORD}")


async def seed_support(db):
    existing = (await db.execute(select(User).where(User.email == SUPPORT_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Support user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": SUPPORT_EMAIL,
            "password": SUPPORT_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "Support Engineer"},
        }
    )

    user = User(
        id=uuid.UUID(auth_response.user.id),
        name="Support Engineer",
        email=SUPPORT_EMAIL,
        role="support",
        phone="+91-98765-43217",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    print(f"Support user created: {SUPPORT_EMAIL} / {SUPPORT_PASSWORD}")


async def seed_finance(db):
    existing = (await db.execute(select(User).where(User.email == FINANCE_EMAIL))).scalar_one_or_none()
    if existing:
        print("i  Finance user already exists")
        return

    admin_client = get_admin_client()
    auth_response = admin_client.auth.admin.create_user(
        {
            "email": FINANCE_EMAIL,
            "password": FINANCE_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": "Finance Manager"},
        }
    )

    user = User(
        id=uuid.UUID(auth_response.user.id),
        name="Finance Manager",
        email=FINANCE_EMAIL,
        role="finance",
        phone="+91-98765-43218",
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    print(f"Finance user created: {FINANCE_EMAIL} / {FINANCE_PASSWORD}")


async def run():
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

        await db.commit()
        print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(run())
