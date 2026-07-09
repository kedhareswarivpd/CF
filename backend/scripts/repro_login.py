import asyncio
import random
from starlette.concurrency import run_in_threadpool
from app.services.supabase_client import get_admin_client, get_anon_client

async def main():
    admin = get_admin_client()
    email = f'test_{random.randint(1,999999)}@example.com'
    password = 'StrongPassword123!'
    print('creating', email)
    try:
        response = await run_in_threadpool(
            admin.auth.admin.create_user,
            {'email': email, 'password': password, 'email_confirm': True},
        )
        print('create_ok', response.user.id)
    except Exception as exc:
        print('create_error', type(exc).__name__, exc)
        return

    anon = get_anon_client()
    try:
        auth_response = await run_in_threadpool(
            anon.auth.sign_in_with_password,
            {'email': email, 'password': password},
        )
        print('login_ok', auth_response.session is not None)
        print('access_token', auth_response.session.access_token[:20] if auth_response.session else None)
    except Exception as exc:
        print('login_error', type(exc).__name__, exc)

if __name__ == '__main__':
    asyncio.run(main())
