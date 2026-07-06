# CoreFusion Technologies — FastAPI Backend

A production-ready Python/FastAPI + PostgreSQL backend powering the CoreFusion
Technologies website, Admin Panel, Client Portal, and Employee Portal — built
directly from the Website Master Content Pack (Version 1.0). This is the
Python/FastAPI counterpart of the Node.js/Express version, with equivalent
module coverage and architecture.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Python 3.12, FastAPI |
| Database | **Supabase Postgres** (SQLAlchemy 2.0 async ORM + asyncpg) |
| Migrations | Alembic |
| Auth | **Supabase Auth** (`supabase-py`) — signup/login/refresh/password-reset all delegated to Supabase; this backend only verifies the resulting JWTs and stores app-specific profile/role data |
| Cache | Redis 7 |
| Validation | Pydantic v2 |
| File uploads | Local disk via `UploadFile` (swap for Supabase Storage or S3 easily) |
| Email | aiosmtplib (contact form only — auth emails are sent by Supabase) |
| Rate limiting | slowapi |
| Server | Uvicorn (dev) / Gunicorn + Uvicorn workers (prod) |
| Deployment | Docker, Docker Compose, Nginx, GitHub Actions |

---

## 2. Folder Structure

```
corefusion-fastapi/
├── app/
│   ├── core/               # config, database engine, security (JWT/bcrypt), dependencies, logger, errors
│   ├── models/              # 35 SQLAlchemy models (async, UUID PKs, soft-delete-ready) + enums + associations
│   ├── schemas/              # Pydantic request/response models, grouped by domain
│   ├── crud/                 # CRUDBase — generic async list/get/create/update/delete
│   ├── routers/               # FastAPI routers, one per resource + aggregator (routers/__init__.py)
│   ├── services/               # email_service (reusable business logic)
│   ├── utils/                   # responses, pagination, router_factory, uploads
│   ├── seeders/                  # seed.py — creates super admin + reference data
│   └── main.py                    # FastAPI app: middleware, exception handlers, router mounting
├── alembic/                 # migration environment (async-aware env.py)
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml   # api + postgres + redis + nginx
│   └── nginx.conf
├── tests/                    # pytest + httpx smoke tests
├── .github/workflows/deploy.yml   # CI: test → build image → deploy over SSH
├── uploads/                  # local file storage (gitignored, mounted volume in Docker)
├── logs/                      # rotating file logs (error.log, combined.log)
├── requirements.txt
├── alembic.ini
└── .env.example
```

### Why this shape
- **`CRUDBase`** (`app/crud/base.py`) is the async equivalent of a Node.js `crudFactory` —
  generic list/get/create/update/delete against any SQLAlchemy model, with pagination,
  sorting, search, and filters built in.
- **`build_crud_router`** (`app/utils/router_factory.py`) is the equivalent of a Node.js
  `routeFactory` — generates a full REST router (GET list/one, POST, PUT, DELETE) for simple
  CMS resources (Categories, Services, Industries, Technologies, Case Studies, Portfolio,
  Testimonials, Partners, Awards, FAQs, Gallery, Downloads, Events, Meetings, Roles,
  Permissions) so those 15+ modules share one audited implementation.
- **Custom routers** handle anything with real logic: Auth, Users, Employees (self-service
  portal: check-in/out, leave, timesheets, payslips), Clients (self-service portal: projects,
  invoices, tickets), Projects/Tasks, Finance (invoices/payments), Careers (public apply with
  resume upload), Contact, Blog (slug/publish workflow + comments), Tickets (support desk +
  reply thread), Dashboard analytics.
- **`app/models/__init__.py`** imports every model so SQLAlchemy's mapper registry and
  string-based `relationship()` references resolve correctly, and so Alembic sees the full
  schema when autogenerating migrations.

---

## 3. Supabase Integration

This backend uses **Supabase Auth** for signup, login, sessions, password
resets, and email verification — this app never sees or stores a password.
Because Supabase Auth's `auth.users` table lives inside the same Postgres
database as everything else, this app also connects directly to your
**Supabase project's Postgres instance** as its database.

### How it fits together
- `app/models/user.py` defines a `public.users` **profile table**, one row
  per person, whose primary key `id` is a foreign key to `auth.users.id`
  (`ON DELETE CASCADE`). It stores everything Supabase doesn't know about:
  `role` (the RBAC role used throughout this app — `admin`, `hr`, `client`,
  etc.), `phone`, `avatar`, `is_active`, and portal linkage
  (`employee_profile` / `client_profile`).
- `app/services/supabase_client.py` exposes two clients:
  - **anon client** — used for sign-in/sign-up/refresh/password-reset, i.e.
    anything a person does on their own behalf.
  - **admin client** (service-role key) — used for backend-privileged
    operations: creating a staff account from the Admin Panel, banning/
    deleting a user, and the seed script. **Never expose the service-role
    key to a frontend.**
- `app/core/security.py` (`decode_supabase_token`) verifies the JWT that
  Supabase issues, using your project's JWT secret — no network call needed.
- `app/core/dependencies.py` (`get_current_user`) verifies the token, then
  loads (or, for accounts that signed up directly through Supabase — e.g. via
  a social/OAuth provider — auto-creates) the matching `public.users` row.

### Setup
1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → Database** → copy the host/port/password into
   `DB_HOST` / `DB_PORT` / `DB_PASS` in `.env` (user is `postgres`, db name is
   `postgres` unless you changed it). Use the direct connection (port `5432`)
   for a long-running server like this one; if you ever run this behind a
   serverless platform, use the **Transaction pooler** host/port `6543`
   instead and set `DB_USE_PGBOUNCER=true`.
3. **Project Settings → API** → copy the Project URL, `anon` `public` key,
   and `service_role` `secret` key into `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.
4. **Project Settings → API → JWT Settings** → copy the JWT Secret into
   `SUPABASE_JWT_SECRET`.
5. Run `alembic upgrade head` — this creates all of this app's tables
   (`public.users`, `employees`, `projects`, …) in your Supabase database,
   including the FK from `public.users.id` to the `auth.users` table that
   Supabase already provisioned for you.
6. `python -m app.seeders.seed` creates the super admin **in Supabase Auth**
   (via the admin API) and its matching profile row.

### A note on registration flows
`POST /api/v1/auth/register` and the Admin Panel's "create user" both use the
Supabase **admin** API with `email_confirm: true`, so the account is usable
immediately — appropriate for an admin/API-driven flow. If you want Supabase's
standard "confirm your email" flow instead (e.g. for public self-signup),
swap that call for the anon client's `auth.sign_up(...)`, which sends the
confirmation email itself and only returns a session once confirmed.

---

## 4. Module Coverage (mapped from the Content Pack)

| Content Pack Section | Implementation |
|---|---|
| Services / Industries / Technologies / Portfolio / Case Studies / Projects | `services`, `industries`, `technologies`, `portfolio`, `case-studies`, `projects` routers |
| Careers | `careers` router (public listing + apply with resume upload, HR admin management) |
| Blog | `blogs` router (categories, comments, publish workflow) |
| Events / Gallery / Awards / Downloads / FAQ | dedicated CRUD routers, public-read |
| Contact | `contact` router (public form + SMTP notification + admin inbox) |
| Client Portal | `clients/me/*` — profile, projects, invoices, support tickets |
| Employee Portal | `employees/me/*` — profile, attendance, leave, timesheets, payslips |
| Admin Panel / Dashboard | `dashboard` router — KPIs, project status breakdown |
| User Roles / Database (Users, Roles, Permissions) | `users`, `access-control/roles`, `access-control/permissions` |
| Security (JWT, RBAC, rate limiting, audit logs) | `core/dependencies.py` (`require_roles`), slowapi, `audit-logs` |
| Performance (caching) | `core/redis` connection ready for use in services |
| Deployment (Docker, Nginx, GitHub Actions, PostgreSQL, Redis) | `docker/` + `.github/workflows/deploy.yml` |

---

## 5. Getting Started

```bash
# 1. Create a virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Follow "3. Supabase Integration" above to fill in DB_* and SUPABASE_* values.
# Redis and SMTP are optional (caching / contact-form notifications).

# 3. Run Redis locally (or use Docker, see below) — not required for auth or the DB, just caching

# 4. Generate & apply the initial migration against your Supabase database
alembic revision --autogenerate -m "init schema"
alembic upgrade head

# 5. Run the dev server
uvicorn app.main:app --reload

# 6. Seed a super admin (created in Supabase Auth) + reference data
python -m app.seeders.seed
```

Interactive API docs: `http://localhost:8000/docs` (Swagger) or `/redoc`.

Default seeded admin (change immediately in production):
```
email: admin@corefusiontech.com
password: ChangeMe@123
```

### Running with Docker
```bash
cp .env.example .env   # edit values, including your Supabase credentials
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml exec api alembic upgrade head
docker compose -f docker/docker-compose.yml exec api python -m app.seeders.seed
```
API available at `http://localhost` (via Nginx) or `http://localhost:8000` directly.
Note the compose stack no longer runs Postgres locally — it connects to Supabase.

### Pairing with the CoreFusion frontend

This backend is designed to pair with the CoreFusion frontend (Vite/React).
If you're using the combined `corefusion-platform` monorepo, it's the sibling
`../frontend` folder and its dev server proxies straight to `uvicorn` on
`:8000` — no CORS setup is needed for local dev. Just run both:

```bash
# terminal 1
uvicorn app.main:app --reload

# terminal 2 (in ../frontend/)
npm run dev
```

`app/main.py`'s CORS middleware also explicitly allows `http://localhost:5173`
(Vite's default port) as a fallback for non-proxied requests. See the
frontend's README ("Connecting to the Backend") for the full picture.

---

## 6. API Conventions

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <access_token>` header (from `POST /api/v1/auth/login`)
- Responses: `{ success, status_code, message, data, meta? }`
- Pagination: `?page=1&limit=20&sort=-created_at&search=keyword`
- Errors: `{ success: false, status_code, message, errors?: [{field, message}] }`

### Key endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/me

GET    /api/v1/projects                    (public: published only)
GET    /api/v1/services
GET    /api/v1/careers
POST   /api/v1/careers/{career_id}/apply    (multipart/form-data, field "resume")
POST   /api/v1/contact

GET    /api/v1/employees/me/profile         (Employee Portal, auth required)
GET    /api/v1/clients/me/projects          (Client Portal, auth required)
GET    /api/v1/dashboard/overview           (Admin Panel, admin/PM/finance/sales only)
```

---

## 7. Security Notes for Production
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to a frontend/client app — it bypasses RLS and can manage any user.
- Put the API behind HTTPS (terminate TLS at Nginx/load balancer).
- Swap local disk uploads (`app/utils/uploads.py`) for Supabase Storage or S3/GCS.
- Run `alembic upgrade head` on deploy instead of relying on ad-hoc table creation.
- Rotate the default seeded admin password immediately.
- Consider enabling Row Level Security (RLS) on your Supabase tables as defense-in-depth even though this API also enforces RBAC at the application layer.
- Gunicorn worker count in `docker/Dockerfile` should scale with CPU cores (`2 * cores + 1`).
