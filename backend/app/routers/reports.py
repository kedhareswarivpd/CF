import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportGenerate, ReportOut
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
    dependencies=[Depends(require_roles("admin", "finance"))],
)

crud = CRUDBase(Report, searchable_fields=["title", "report_type"])


@router.get("", response_model=dict)
async def list_reports(
    request: Request,
    db: AsyncSession = Depends(get_db),
    page: PageParams = Depends(page_params),
):
    try:
        filters = {
            k: request.query_params.get(k)
            for k in ("report_type",)
            if request.query_params.get(k)
        }
        items, total = await crud.list(db, page, filters)
        meta = build_pagination_meta(total, page.page, page.limit)
        return success_response(
            data=[ReportOut.model_validate(r) for r in items],
            message="Reports fetched",
            meta=meta,
        )
    except ApiError:
        raise
    except Exception as e:
        logger.exception(f"Failed to list reports: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list reports: {str(e)}"
        )


@router.post("/generate", response_model=dict, status_code=201)
async def generate_report(
    payload: ReportGenerate,
    db: AsyncSession = Depends(get_db),
    # require_roles already ran at the router level and verified the user;
    # we declare it again here only to receive the resolved User object.
    # FastAPI deduplicates the dependency — it will NOT open a second DB session.
    current_user: User = Depends(require_roles("admin", "finance")),
):
    try:
        # Validate required fields before processing
        if not payload.title or not payload.title.strip():
            raise HTTPException(
                status_code=400,
                detail="Title is required and cannot be empty"
            )
        if not payload.report_type or not payload.report_type.strip():
            raise HTTPException(
                status_code=400,
                detail="Report type is required and cannot be empty"
            )
        if not payload.period or not payload.period.strip():
            raise HTTPException(
                status_code=400,
                detail="Period is required and cannot be empty"
            )

        logger.info(
            f"Generating report: title={payload.title}, type={payload.report_type}, "
            f"period={payload.period}, user_id={current_user.id}"
        )

        report = await crud.create(
            db, {**payload.model_dump(), "generated_by": current_user.id}
        )

        logger.info(f"Report generated successfully: id={report.id}")

        return success_response(
            data=ReportOut.model_validate(report),
            message="Report generated",
            status_code=201,
        )
    except HTTPException:
        # Re-raise HTTP exceptions (400, 401, 404, etc.) as-is
        raise
    except Exception as e:
        logger.exception(f"Failed to generate report: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )


@router.delete("/{report_id}", response_model=dict)
async def delete_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    try:
        await crud.delete(db, report_id)
        return success_response(message="Report deleted")
    except ApiError:
        raise
    except Exception as e:
        logger.exception(f"Failed to delete report: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete report: {str(e)}"
        )
