from app.core.database import Base  # noqa: F401
from app.models.associations import project_members, role_permissions  # noqa: F401

# Core auth
from app.models.user import User  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.permission import Permission  # noqa: F401

# HR / organization
from app.models.department import Department  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.attendance import Attendance  # noqa: F401
from app.models.leave import Leave  # noqa: F401
from app.models.timesheet import Timesheet  # noqa: F401
from app.models.payslip import Payslip  # noqa: F401
from app.models.employee_document import EmployeeDocument  # noqa: F401

# Business
from app.models.client import Client  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.task import Task  # noqa: F401
from app.models.invoice import Invoice  # noqa: F401
from app.models.payment import Payment  # noqa: F401

# CMS / content
from app.models.category import Category  # noqa: F401
from app.models.blog import Blog  # noqa: F401
from app.models.comment import Comment  # noqa: F401
from app.models.service import Service  # noqa: F401
from app.models.industry import Industry  # noqa: F401
from app.models.technology import Technology  # noqa: F401
from app.models.case_study import CaseStudy  # noqa: F401
from app.models.portfolio import Portfolio  # noqa: F401
from app.models.testimonial import Testimonial  # noqa: F401
from app.models.partner import Partner  # noqa: F401
from app.models.award import Award  # noqa: F401
from app.models.faq import Faq  # noqa: F401
from app.models.gallery import Gallery  # noqa: F401
from app.models.download import Download  # noqa: F401
from app.models.career import Career  # noqa: F401
from app.models.application import Application  # noqa: F401
from app.models.event import Event  # noqa: F401

# Ops / support
from app.models.ticket import Ticket  # noqa: F401
from app.models.ticket_reply import TicketReply  # noqa: F401
from app.models.meeting import Meeting  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.setting import Setting  # noqa: F401
from app.models.media import Media  # noqa: F401
from app.models.contact_submission import ContactSubmission  # noqa: F401

# Phase 2 — new resources
from app.models.product import Product  # noqa: F401
from app.models.solution import Solution  # noqa: F401
from app.models.resource import Resource  # noqa: F401
from app.models.training import Course, TrainingEnrollment  # noqa: F401
from app.models.performance_review import PerformanceReview  # noqa: F401
from app.models.newsletter import NewsletterSubscriber  # noqa: F401
from app.models.seo import SeoMetadata  # noqa: F401
from app.models.page_content import PageContent  # noqa: F401
from app.models.analytics import PageView  # noqa: F401

__all__ = [
    "Base", "project_members", "role_permissions",
    "User", "Role", "Permission",
    "Department", "Employee", "Attendance", "Leave", "Timesheet", "Payslip", "EmployeeDocument",
    "Client", "Project", "Task", "Invoice", "Payment",
    "Category", "Blog", "Comment", "Service", "Industry", "Technology", "CaseStudy",
    "Portfolio", "Testimonial", "Partner", "Award", "Faq", "Gallery", "Download",
    "Career", "Application", "Event",
    "Ticket", "TicketReply", "Meeting", "Notification", "AuditLog", "Setting", "Media",
    "ContactSubmission",
    "Product", "Solution", "Resource",
    "Course", "TrainingEnrollment",
    "PerformanceReview",
    "NewsletterSubscriber",
    "SeoMetadata", "PageContent", "PageView",
]
