import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text


async def q():
    async with AsyncSessionLocal() as db:
        r = await db.execute(text("SELECT COUNT(*) FROM employees"))
        print("employees:", r.scalar())
        r2 = await db.execute(text("SELECT COUNT(*) FROM clients"))
        print("clients:", r2.scalar())
        r3 = await db.execute(text("SELECT id, email, name, role FROM users ORDER BY created_at"))
        for row in r3.fetchall():
            print(f"  {row[1]}  role={row[3]}")


asyncio.run(q())