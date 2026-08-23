#!/usr/bin/env bash
# Runs `alembic upgrade head` (or any other alembic command) against a named
# environment's .env file, via app/core/config.py's ENV_FILE override.
#
# Deliberately does NOT `source` the .env file in bash — .env syntax is not
# bash syntax (e.g. SMTP_FROM's `Name <email>` format breaks bash's `<` as
# input redirection, which genuinely happened when this was tried). Setting
# ENV_FILE and letting pydantic-settings' real dotenv parser load it (the
# same parser the app itself uses) avoids that whole class of bug.
#
# Usage:
#   bash scripts/migrate.sh local              # local Postgres container (docker-compose.override.yml)
#   bash scripts/migrate.sh staging            # Supabase staging Postgres (backend/.env.staging)
#   bash scripts/migrate.sh both               # local, then staging — the two-target workflow requested
#   bash scripts/migrate.sh local downgrade -1 # extra args are passed through to `alembic`
#
# "local" assumes the local Postgres container is already running
# (`docker compose up -d postgres`) and reachable at localhost:5432 — the
# same host-facing port docker-compose.override.yml publishes.

set -euo pipefail
cd "$(dirname "$0")/.."

PYTHON=".venv/Scripts/python.exe"
[ -x "$PYTHON" ] || PYTHON="python"

run_against() {
    local env_file="$1"
    shift
    if [ ! -f "$env_file" ]; then
        echo "FAIL: $env_file not found" >&2
        exit 1
    fi
    local args=("$@")
    if [ "${#args[@]}" -eq 0 ]; then
        args=(upgrade head)
    fi
    echo "== Running alembic ${args[*]} against $env_file =="
    ENV_FILE="$env_file" "$PYTHON" -m alembic "${args[@]}"
}

target="${1:-}"
shift || true

case "$target" in
    local)
        run_against ".env" "$@"
        ;;
    staging)
        run_against ".env.staging" "$@"
        ;;
    both)
        run_against ".env" upgrade head
        run_against ".env.staging" upgrade head
        ;;
    *)
        echo "Usage: bash scripts/migrate.sh {local|staging|both} [alembic args...]" >&2
        exit 1
        ;;
esac
