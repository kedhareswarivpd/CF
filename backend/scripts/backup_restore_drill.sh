#!/usr/bin/env bash
# Reproducible, disposable PostgreSQL backup/restore verification drill.
#
# Why this exists (CF-AUD's "backup verified" / "restore tested" gate — see
# status.md §39/§43): production backups are managed by Supabase and this
# repo has no credentials to touch them, but "we can't verify production
# backups" is not a reason to leave backup/restore completely unverified.
# This proves the *mechanism* end-to-end against disposable local Postgres
# containers — the same pg_dump/pg_restore tooling that would be used
# against a real snapshot — so the procedure itself is proven, not assumed.
#
# What it proves:
#   1. A real logical backup (pg_dump -Fc) can be taken from a running DB.
#   2. That backup restores cleanly into a genuinely separate, empty database
#      (schema + data), with no manual intervention.
#   3. Row counts and index counts match between source and restored DB.
#   4. The CoreFusion application itself can connect to the restored DB and
#      successfully run a real query — i.e. restoring the backup produces a
#      database the app can actually serve traffic from, not just a schema
#      that looks right.
#
# Usage: bash scripts/backup_restore_drill.sh
# Requires: Docker running locally. Cleans up its own containers on exit.

set -euo pipefail
cd "$(dirname "$0")/.."

SRC=cf-backup-drill-src
DST=cf-backup-drill-restored
DUMP_FILE="$(pwd)/backup_drill.dump"

cleanup() {
  docker rm -f "$SRC" "$DST" >/dev/null 2>&1 || true
  rm -f "$DUMP_FILE"
}
trap cleanup EXIT

# Postgres' Docker entrypoint briefly accepts connections during its internal
# initdb bootstrap, then restarts for real — pg_isready can report "ready"
# during that transient window. A real `SELECT 1` is the only reliable gate.
wait_for_postgres() {
  local container="$1" db="$2" user="$3"
  for i in $(seq 1 60); do
    if docker exec "$container" psql -U "$user" -d "$db" -c "SELECT 1" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "FAIL: $container did not become ready within 60s"
  docker logs "$container" 2>&1 | tail -30
  exit 1
}

echo "== 1/6: starting disposable source Postgres =="
docker rm -f "$SRC" >/dev/null 2>&1 || true
docker run -d --name "$SRC" -e POSTGRES_DB=drill -e POSTGRES_USER=drill -e POSTGRES_PASSWORD=drill -p 55440:5432 postgres:16-alpine >/dev/null
wait_for_postgres "$SRC" drill drill
docker exec "$SRC" psql -U drill -d drill -c "CREATE SCHEMA IF NOT EXISTS auth;" >/dev/null
docker exec "$SRC" psql -U drill -d drill -c "CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid());" >/dev/null

echo "== 2/6: applying real Alembic migration chain =="
ENV=test DB_HOST=localhost DB_PORT=55440 DB_NAME=drill DB_USER=drill DB_PASS=drill \
  .venv/Scripts/python.exe -m alembic upgrade head

echo "== 3/6: seeding representative data and taking a real pg_dump =="
ENV=test DB_HOST=localhost DB_PORT=55440 DB_NAME=drill DB_USER=drill DB_PASS=drill \
  SUPABASE_URL=http://localhost:54321 SUPABASE_ANON_KEY=x SUPABASE_SERVICE_ROLE_KEY=x SUPABASE_JWT_SECRET=x \
  .venv/Scripts/python.exe -m tests.real_db_verification >/dev/null
MSYS_NO_PATHCONV=1 docker exec "$SRC" pg_dump -U drill -d drill -Fc -f /tmp/backup.dump
docker cp "$SRC:/tmp/backup.dump" "$DUMP_FILE"
SRC_EMPLOYEES=$(docker exec "$SRC" psql -U drill -d drill -t -c "SELECT count(*) FROM employees;" | tr -d ' \n')
SRC_INDEXES=$(docker exec "$SRC" psql -U drill -d drill -t -c "SELECT count(*) FROM pg_indexes WHERE indexname LIKE 'ix_%';" | tr -d ' \n')
echo "   source: $SRC_EMPLOYEES employees, $SRC_INDEXES FK indexes, dump size $(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE") bytes"

echo "== 4/6: restoring into a genuinely separate, empty database =="
docker rm -f "$DST" >/dev/null 2>&1 || true
docker run -d --name "$DST" -e POSTGRES_DB=drill_restored -e POSTGRES_USER=drill -e POSTGRES_PASSWORD=drill -p 55441:5432 postgres:16-alpine >/dev/null
wait_for_postgres "$DST" drill_restored drill
docker cp "$DUMP_FILE" "$DST:/tmp/backup.dump"
MSYS_NO_PATHCONV=1 docker exec "$DST" pg_restore -U drill -d drill_restored --no-owner --no-privileges /tmp/backup.dump

echo "== 5/6: verifying restored schema + data match source =="
DST_EMPLOYEES=$(docker exec "$DST" psql -U drill -d drill_restored -t -c "SELECT count(*) FROM employees;" | tr -d ' \n')
DST_INDEXES=$(docker exec "$DST" psql -U drill -d drill_restored -t -c "SELECT count(*) FROM pg_indexes WHERE indexname LIKE 'ix_%';" | tr -d ' \n')
DST_TABLES=$(docker exec "$DST" psql -U drill -d drill_restored -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" | tr -d ' \n')
echo "   restored: $DST_EMPLOYEES employees, $DST_INDEXES FK indexes, $DST_TABLES tables"
if [ "$SRC_EMPLOYEES" != "$DST_EMPLOYEES" ] || [ "$SRC_INDEXES" != "$DST_INDEXES" ]; then
  echo "FAIL: restored data/schema does not match source"
  exit 1
fi

echo "== 6/6: verifying the application can connect to the restored DB =="
ENV=test DB_HOST=localhost DB_PORT=55441 DB_NAME=drill_restored DB_USER=drill DB_PASS=drill \
  SUPABASE_URL=http://localhost:54321 SUPABASE_ANON_KEY=x SUPABASE_SERVICE_ROLE_KEY=x SUPABASE_JWT_SECRET=x \
  .venv/Scripts/python.exe -c "
import asyncio
from unittest.mock import patch, MagicMock
patch('app.services.supabase_client.create_client', return_value=MagicMock()).start()
from app.core.database import AsyncSessionLocal
from app.models.employee import Employee
from sqlalchemy import select, func

async def main():
    async with AsyncSessionLocal() as db:
        count = (await db.execute(select(func.count()).select_from(Employee))).scalar_one()
        assert count == $SRC_EMPLOYEES, f'expected $SRC_EMPLOYEES, got {count}'
        print(f'Application connected to restored DB and verified {count} employees')

asyncio.run(main())
"

echo ""
echo "BACKUP/RESTORE DRILL: PASS — pg_dump -> pg_restore -> schema match -> data match -> app connects"
