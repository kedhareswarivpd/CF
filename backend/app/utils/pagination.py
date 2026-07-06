from fastapi import Query
from pydantic import BaseModel


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
