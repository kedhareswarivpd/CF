from fastapi import Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

# Cap for self-service "my own records" list endpoints (e.g. /employees/me/leaves,
# /clients/me/invoices) that intentionally skip full page-param pagination since
# they're already scoped to a single user's own rows. Without *some* limit these
# are unbounded production queries (CF-BE-005) — an account that accumulates years
# of records would return everything in one response. 500 is far above realistic
# usage for any of these resources; raise it (or migrate to real pagination) only
# if a legitimate use case needs more.
SELF_SERVICE_LIST_CAP = 500


class PageParams(BaseModel):
    page: int = 1
    limit: int = 20
    sort: str | None = None
    search: str | None = None

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def page_params(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str | None = Query(None, description="e.g. -created_at,title"),
    search: str | None = Query(None),
) -> PageParams:
    return PageParams(page=page, limit=limit, sort=sort, search=search)


async def paginate_query(db: AsyncSession, stmt, count_stmt, page: PageParams):
    """Execute a pre-filtered `stmt`/`count_stmt` pair with page/limit applied
    and return `(items, meta)`. Extracted from employees.py/training.py, which
    each hand-rolled this same "run paginated select + matching count select +
    build meta" tail independently (CF-BE-006) — building the *filtered*
    `stmt`/`count_stmt` themselves stays per-endpoint since the filter columns
    differ per model; only this identical tail is shared.
    """
    from app.utils.responses import build_pagination_meta

    stmt = stmt.offset(page.offset).limit(page.limit)
    items = (await db.execute(stmt)).scalars().all()
    total = (await db.execute(count_stmt)).scalar_one()
    return items, build_pagination_meta(total, page.page, page.limit)


def apply_sort(query, model, sort: str | None, default_field: str = "created_at"):
    """Applies `sort=-created_at,title` style ordering to a SQLAlchemy select()."""
    if not sort:
        return query.order_by(getattr(model, default_field).desc())
    for field in sort.split(","):
        field = field.strip()
        if not field:
            continue
        desc = field.startswith("-")
        col_name = field[1:] if desc else field
        column = getattr(model, col_name, None)
        if column is None:
            continue
        query = query.order_by(column.desc() if desc else column.asc())
    return query
