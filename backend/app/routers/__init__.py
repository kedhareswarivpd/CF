from fastapi import APIRouter

from app.routers import (
    audit_log, auth, award, blog, career, case_study, category, clients,
    contact, dashboard, download, employees, event, faq, finance, gallery,
    gdpr, industry, media, meeting, notification, partner, portfolio, projects,
    reports, role, service, setting, stats, task, technology, testimonial, ticket, users,
    # Phase 2
    analytics, newsletter, page_content, performance_review, product,
    resource, seo, solution, training,
    # Phase 3 — Sales CRM
    contracts, leads, proposals,
    # Phase 4 — Super Admin
    department,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(users.self_router)
api_router.include_router(gdpr.self_router)
api_router.include_router(gdpr.router)
api_router.include_router(stats.router)
api_router.include_router(employees.router)
api_router.include_router(clients.router)
api_router.include_router(projects.router)
api_router.include_router(task.router)
api_router.include_router(finance.router)
api_router.include_router(career.router)
api_router.include_router(contact.router)
api_router.include_router(blog.router)
api_router.include_router(category.router)
api_router.include_router(service.router)
api_router.include_router(industry.router)
api_router.include_router(technology.router)
api_router.include_router(case_study.router)
api_router.include_router(portfolio.router)
api_router.include_router(testimonial.router)
api_router.include_router(partner.router)
api_router.include_router(award.router)
api_router.include_router(faq.router)
api_router.include_router(gallery.router)
api_router.include_router(download.router)
api_router.include_router(event.router)
api_router.include_router(ticket.router)
api_router.include_router(meeting.router)
api_router.include_router(notification.router)
api_router.include_router(media.router)
api_router.include_router(setting.router)
api_router.include_router(audit_log.router)
api_router.include_router(dashboard.router)
api_router.include_router(role.router)

# Phase 2
api_router.include_router(product.router)
api_router.include_router(solution.router)
api_router.include_router(resource.router)
api_router.include_router(training.router)
api_router.include_router(performance_review.router)
api_router.include_router(newsletter.router)
api_router.include_router(seo.router)
api_router.include_router(page_content.router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)

# Phase 3 — Sales CRM
api_router.include_router(leads.router)
api_router.include_router(proposals.router)
api_router.include_router(contracts.router)

# Phase 4 — Super Admin
api_router.include_router(department.router)
