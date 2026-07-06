import enum


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    hr = "hr"
    sales = "sales"
    marketing = "marketing"
    project_manager = "project_manager"
    developer = "developer"
    qa = "qa"
    support = "support"
    finance = "finance"
    client = "client"
    employee = "employee"
    guest = "guest"


class EmploymentType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    intern = "intern"


class EmployeeStatus(str, enum.Enum):
    active = "active"
    on_leave = "on_leave"
    terminated = "terminated"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    holiday = "holiday"
    weekend = "weekend"


class LeaveType(str, enum.Enum):
    sick = "sick"
    casual = "casual"
    earned = "earned"
    unpaid = "unpaid"
    maternity = "maternity"
    paternity = "paternity"


class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class TimesheetStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"


class PayslipStatus(str, enum.Enum):
    generated = "generated"
    paid = "paid"


class DocumentType(str, enum.Enum):
    resume = "resume"
    id_proof = "id_proof"
    contract = "contract"
    certificate = "certificate"
    other = "other"


class ProjectStatus(str, enum.Enum):
    planning = "planning"
    in_progress = "in_progress"
    on_hold = "on_hold"
    completed = "completed"
    cancelled = "cancelled"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"
    blocked = "blocked"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    bank_transfer = "bank_transfer"
    card = "card"
    upi = "upi"
    paypal = "paypal"
    cheque = "cheque"
    other = "other"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class BlogStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class CommentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    spam = "spam"


class CategoryType(str, enum.Enum):
    blog = "blog"
    gallery = "gallery"
    download = "download"
    event = "event"


class TechnologyCategory(str, enum.Enum):
    frontend = "frontend"
    backend = "backend"
    database = "database"
    cloud = "cloud"
    devops = "devops"
    ai_ml = "ai_ml"
    mobile = "mobile"
    other = "other"


class PartnerType(str, enum.Enum):
    technology_partner = "technology_partner"
    business_partner = "business_partner"
    reseller = "reseller"


class GalleryType(str, enum.Enum):
    image = "image"
    video = "video"


class CareerEmploymentType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"


class CareerStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    interview = "interview"
    offered = "offered"
    rejected = "rejected"
    hired = "hired"


class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class MeetingStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class NotificationType(str, enum.Enum):
    info = "info"
    success = "success"
    warning = "warning"
    error = "error"


class ContactStatus(str, enum.Enum):
    new = "new"
    in_progress = "in_progress"
    resolved = "resolved"
    spam = "spam"
