// Every path that renders the employee portal. All render the same component;
// the portal derives the active role from the authenticated profile.
export const employeePortalPaths = ['employee', 'sales', 'marketing', 'developer', 'project-manager', 'qa', 'support', 'finance', 'hr'];

// Every route that renders a full-screen portal (no public footer).
export const portalPaths = ['client', ...employeePortalPaths, 'admin', 'super-admin', 'super-admin/login', 'login', 'register'];

export const clientPortalTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'invoices', label: 'Invoices', icon: 'receipt' },
  { id: 'payments', label: 'Payments', icon: 'payments' },
  { id: 'files', label: 'Files', icon: 'folder_open' },
  { id: 'meetings', label: 'Meetings', icon: 'video_call' },
  { id: 'reports', label: 'Reports', icon: 'bar_chart' },
  { id: 'tickets', label: 'Support', icon: 'support' },
];

export const employeePortalTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'attendance', label: 'Attendance', icon: 'clock_loader_60' },
  { id: 'leaves', label: 'Leaves', icon: 'beach_access' },
  { id: 'timesheets', label: 'Timesheets', icon: 'assignment' },
  { id: 'payslips', label: 'Payslips', icon: 'payments' },
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { id: 'projects', label: 'Projects', icon: 'folder_open' },
  { id: 'performance', label: 'Performance', icon: 'trending_up' },
  { id: 'training', label: 'Training', icon: 'school' },
  { id: 'documents', label: 'Documents', icon: 'description' },
];

// Extra tabs spliced into employeePortalTabs (right after Overview) for roles
// with a dedicated workspace beyond the generic HR/attendance set — see
// docs/ROLE_WORKFLOW.md §2 for the full per-role navigation spec.
export const rolePortalTabs = {
  sales: [
    { id: 'leads', label: 'Leads', icon: 'person_search' },
    { id: 'proposals', label: 'Proposals', icon: 'request_quote' },
    { id: 'contracts', label: 'Contracts', icon: 'gavel' },
  ],
  marketing: [
    { id: 'marketing-leads', label: 'Leads Handoff', icon: 'campaign' },
    { id: 'testimonials', label: 'Testimonials', icon: 'rate_review' },
  ],
  project_manager: [
    { id: 'team-projects', label: 'Team Projects', icon: 'space_dashboard' },
    { id: 'task-board', label: 'Task Board', icon: 'view_kanban' },
    { id: 'approvals', label: 'Approvals', icon: 'fact_check' },
  ],
  qa: [
    { id: 'test-queue', label: 'Test Queue', icon: 'bug_report' },
  ],
  support: [
    { id: 'ticket-queue', label: 'Ticket Queue', icon: 'confirmation_number' },
  ],
  finance: [
    { id: 'invoices', label: 'Invoices', icon: 'receipt_long' },
  ],
  hr: [
    { id: 'leave-approvals', label: 'Leave Approvals', icon: 'event_available' },
    { id: 'recruitment', label: 'Recruitment', icon: 'group_add' },
  ],
};

export function employeeTabsForRole(role) {
  const extra = rolePortalTabs[role] || [];
  if (!extra.length) return employeePortalTabs;
  const [overview, ...rest] = employeePortalTabs;
  return [overview, ...extra, ...rest];
}

export const adminPanelTabs = [
  { id: 'overview',       label: 'Dashboard',    icon: 'dashboard' },
  { id: 'content',        label: 'Content',       icon: 'article' },
  { id: 'projects',       label: 'Projects',      icon: 'folder' },
  { id: 'users',          label: 'Users',         icon: 'people' },
  { id: 'employees',      label: 'Employees',     icon: 'badge' },
  { id: 'clients',        label: 'Clients',       icon: 'business' },
  { id: 'roles',          label: 'Roles',         icon: 'verified_user' },
  { id: 'media',          label: 'Media',         icon: 'perm_media' },
  { id: 'notifications',  label: 'Notifications', icon: 'notifications' },
  { id: 'reports',        label: 'Reports',       icon: 'assessment' },
  { id: 'logs',           label: 'Audit Logs',    icon: 'history' },
];

export const demoClientProfile = {
  company_name: 'Acme Corp',
  contact_name: 'John Smith',
  email: 'john@acmecorp.com',
  phone: '+1-555-0123',
  country: 'United States',
  industry: 'Financial Services',
};

export const demoClientProjects = [
  { id: '1', title: 'Core Banking Modernization', status: 'in_progress', progress: 65, deadline: '2026-12-31', budget: '$1.2M' },
  { id: '2', title: 'Payment Gateway Integration', status: 'completed', progress: 100, deadline: '2026-06-30', budget: '$450K' },
  { id: '3', title: 'Data Warehouse Migration', status: 'in_progress', progress: 30, deadline: '2027-03-15', budget: '$800K' },
];

export const demoClientInvoices = [
  { id: 'INV-001', amount: 120000, status: 'paid', issueDate: '2026-06-01', dueDate: '2026-06-30' },
  { id: 'INV-002', amount: 85000, status: 'pending', issueDate: '2026-07-01', dueDate: '2026-07-31' },
  { id: 'INV-003', amount: 200000, status: 'overdue', issueDate: '2026-05-01', dueDate: '2026-05-31' },
];

export const demoClientTickets = [
  { id: 'TCK-001', subject: 'Database connection timeout', status: 'open', priority: 'high', createdAt: '2026-07-02' },
  { id: 'TCK-002', subject: 'User permission issue', status: 'in_progress', priority: 'medium', createdAt: '2026-06-28' },
  { id: 'TCK-003', subject: 'API documentation request', status: 'resolved', priority: 'low', createdAt: '2026-06-20' },
];

export const demoTickets = [
  { id: 'TCK-101', ticket_number: 'TCK-101', client_id: null, subject: 'Database connection timeout', description: 'Client reporting intermittent database connection timeouts during peak hours. Needs investigation.', priority: 'high', status: 'open', assigned_to: null },
  { id: 'TCK-102', ticket_number: 'TCK-102', client_id: null, subject: 'User permission issue', description: 'User unable to access the reporting dashboard after a role change. Permissions not propagated.', priority: 'medium', status: 'in_progress', assigned_to: 'u-support' },
  { id: 'TCK-103', ticket_number: 'TCK-103', client_id: null, subject: 'API documentation request', description: 'Client requesting updated API integration documentation for the payment gateway.', priority: 'low', status: 'open', assigned_to: null },
  { id: 'TCK-104', ticket_number: 'TCK-104', client_id: null, subject: 'Invoice download failing', description: 'Downloading invoices returns a 500 error for a subset of invoices. Reproduction steps provided.', priority: 'critical', status: 'open', assigned_to: null },
  { id: 'TCK-105', ticket_number: 'TCK-105', client_id: null, subject: 'SSL certificate renewal', description: 'Certificate renewed on staging; production renewal scheduled.', priority: 'medium', status: 'resolved', assigned_to: 'u-support' },
  { id: 'TCK-106', ticket_number: 'TCK-106', client_id: null, subject: 'SSO login redirect loop', description: 'Users on certain browsers hit a redirect loop during SSO login. Ticket closed after patch verified.', priority: 'high', status: 'closed', assigned_to: 'u-support' },
];

export const demoEmployeeProfile = {
  employee_code: 'EMP-001',
  name: 'Priya Sharma',
  email: 'priya@corefusiontech.com',
  role: 'developer',
  designation: 'Senior Software Engineer',
  department: 'Engineering',
  status: 'active',
};

export const demoLeads = [
  { id: 'l1', company: 'Acme Retail', contact_name: 'Jordan Lee', email: 'jordan@acmeretail.com', phone: '+1-555-0110', source: 'website', status: 'new', estimated_value: 45000, owner_id: null },
  { id: 'l2', company: 'Northwind Logistics', contact_name: 'Casey Kim', email: 'casey@northwind.com', phone: '+1-555-0122', source: 'referral', status: 'contacted', estimated_value: 82000, owner_id: null },
  { id: 'l3', company: 'BlueSky Health', contact_name: 'Alex Rivera', email: 'alex@blueskyhealth.com', phone: '+1-555-0134', source: 'campaign', status: 'requirement_gathering', estimated_value: 120000, owner_id: null },
];

export const demoProposals = [
  { id: 'p1', lead_id: 'l3', scope_summary: 'Patient portal redesign + API integration', price: 65000, currency: 'USD', status: 'draft', sent_at: null },
];

export const demoContracts = [
  { id: 'CON-001', proposal_id: 'p1', status: 'pending', signed_by_client_at: null, signed_by_company_at: null },
];

export const demoAttendance = { date: new Date().toISOString().slice(0, 10), checkIn: null, checkOut: null, status: 'absent' };

export const demoLeaves = [
  { id: 'LV-001', type: 'Annual', from: '2026-08-10', to: '2026-08-14', status: 'approved', days: 5 },
  { id: 'LV-002', type: 'Sick', from: '2026-06-20', to: '2026-06-21', status: 'approved', days: 2 },
  { id: 'LV-003', type: 'Personal', from: '2026-09-05', to: '2026-09-05', status: 'pending', days: 1 },
];

export const demoTimesheets = [
  { id: 'TS-001', date: '2026-07-01', project: 'Core Banking', hours: 8, description: 'API integration' },
  { id: 'TS-002', date: '2026-07-02', project: 'Core Banking', hours: 7.5, description: 'Code review and testing' },
  { id: 'TS-003', date: '2026-07-03', project: 'Payment Gateway', hours: 8, description: 'Payment flow implementation' },
];

export const demoApprovalTimesheets = [
  { id: 'ATS-001', employee_code: 'EMP-006', employee_name: 'Software Developer', designation: 'Developer', date: '2026-07-10', hours: 8, description: 'OAuth2 login flow implementation', status: 'submitted' },
  { id: 'ATS-002', employee_code: 'EMP-007', employee_name: 'QA Engineer', designation: 'QA', date: '2026-07-10', hours: 7, description: 'Payment module test suite', status: 'submitted' },
  { id: 'ATS-003', employee_code: 'EMP-008', employee_name: 'Support Engineer', designation: 'Support', date: '2026-07-11', hours: 8, description: 'API integration guide review', status: 'submitted' },
  { id: 'ATS-004', employee_code: 'EMP-001', employee_name: 'Software Engineer', designation: 'Engineering', date: '2026-07-09', hours: 6.5, description: 'Data warehouse ETL pipeline', status: 'approved' },
  { id: 'ATS-005', employee_code: 'EMP-006', employee_name: 'Software Developer', designation: 'Developer', date: '2026-07-08', hours: 7, description: 'Code review — payment module', status: 'rejected' },
];

export const demoPayslips = [
  { month: 'June', year: 2026, grossPay: 85000, deductions: 12500, netPay: 72500, status: 'paid' },
  { month: 'May', year: 2026, grossPay: 85000, deductions: 12500, netPay: 72500, status: 'paid' },
  { month: 'April', year: 2026, grossPay: 82000, deductions: 11800, netPay: 70200, status: 'paid' },
];

export const demoTasks = [
  { id: 'TSK-001', title: 'Implement OAuth2 login flow', project: 'Core Banking', priority: 'high', status: 'in_progress', due: '2026-07-10' },
  { id: 'TSK-002', title: 'Write unit tests for payment module', project: 'Payment Gateway', priority: 'medium', status: 'todo', due: '2026-07-15' },
  { id: 'TSK-003', title: 'Code review — data warehouse ETL', project: 'Data Warehouse', priority: 'low', status: 'done', due: '2026-07-03' },
  { id: 'TSK-004', title: 'Fix API timeout bug', project: 'Core Banking', priority: 'urgent', status: 'in_progress', due: '2026-07-06' },
];

export const demoQaTasks = [
  { id: 'QA-001', title: 'OAuth2 login flow — regression pass', project: 'Core Banking', priority: 'high', status: 'in_review', due_date: '2026-07-12' },
  { id: 'QA-002', title: 'Payment module — full test suite', project: 'Payment Gateway', priority: 'urgent', status: 'in_review', due_date: '2026-07-11' },
  { id: 'QA-003', title: 'Data warehouse ETL — edge case coverage', project: 'Data Warehouse', priority: 'medium', status: 'in_review', due_date: '2026-07-14' },
  { id: 'QA-004', title: 'API integration guide — doc accuracy check', project: 'Core Banking', priority: 'low', status: 'done', due_date: '2026-07-05' },
  { id: 'QA-005', title: 'Payment gateway timeout bug', project: 'Payment Gateway', priority: 'high', status: 'blocked', due_date: '2026-07-09' },
];

export const demoEmployeeProjects = [
  { id: 'PRJ-001', title: 'Core Banking Modernization', role: 'Lead Developer', status: 'in_progress', progress: 65, deadline: '2026-12-31' },
  { id: 'PRJ-002', title: 'Payment Gateway Integration', role: 'Developer', status: 'completed', progress: 100, deadline: '2026-06-30' },
  { id: 'PRJ-003', title: 'Data Warehouse Migration', role: 'Contributor', status: 'in_progress', progress: 30, deadline: '2027-03-15' },
];

export const demoPerformance = [
  { period: 'Q2 2026', rating: 4.5, goals: 8, achieved: 7, feedback: 'Excellent delivery on Core Banking sprint. Strong code quality.' },
  { period: 'Q1 2026', rating: 4.2, goals: 6, achieved: 5, feedback: 'Good collaboration with cross-functional teams.' },
  { period: 'Q4 2025', rating: 3.9, goals: 7, achieved: 6, feedback: 'Met most targets. Improve documentation practices.' },
];

export const demoTraining = [
  { id: 'TRN-001', title: 'AWS Solutions Architect', category: 'Cloud', status: 'completed', completedOn: '2026-05-20', score: '92%' },
  { id: 'TRN-002', title: 'React Advanced Patterns', category: 'Frontend', status: 'in_progress', completedOn: null, score: null },
  { id: 'TRN-003', title: 'ISO 27001 Security Awareness', category: 'Compliance', status: 'pending', completedOn: null, score: null },
  { id: 'TRN-004', title: 'Agile & Scrum Fundamentals', category: 'Process', status: 'completed', completedOn: '2026-03-10', score: '88%' },
];

export const demoDocuments = [
  { id: 'DOC-001', name: 'Employment Contract', type: 'contract', uploadedOn: '2024-01-15', size: '245 KB' },
  { id: 'DOC-002', name: 'Offer Letter', type: 'other', uploadedOn: '2024-01-10', size: '120 KB' },
  { id: 'DOC-003', name: 'PAN Card', type: 'id_proof', uploadedOn: '2024-01-15', size: '80 KB' },
  { id: 'DOC-004', name: 'AWS Certificate', type: 'certificate', uploadedOn: '2026-05-21', size: '310 KB' },
];

export const demoCareers = [
  { id: 'cr1', title: 'Senior React Developer', slug: 'senior-react-developer', department: 'Engineering', location: 'Delhi, IN', employment_type: 'full_time', experience_required: '5+ years', description: 'Build high-performance web applications for enterprise clients.', status: 'open', posted_at: '2026-07-01' },
  { id: 'cr2', title: 'Backend Engineer (Python)', slug: 'backend-engineer-python', department: 'Engineering', location: 'Remote', employment_type: 'full_time', experience_required: '3+ years', description: 'Design and scale async APIs on FastAPI and PostgreSQL.', status: 'open', posted_at: '2026-06-25' },
  { id: 'cr3', title: 'Cloud Architect', slug: 'cloud-architect', department: 'DevOps', location: 'Dubai, UAE', employment_type: 'contract', experience_required: '8+ years', description: 'Lead cloud migration and infrastructure strategy for clients.', status: 'open', posted_at: '2026-06-18' },
  { id: 'cr4', title: 'QA Engineer', slug: 'qa-engineer', department: 'Quality Assurance', location: 'Delhi, IN', employment_type: 'full_time', experience_required: '2+ years', description: 'Own test automation and release quality gates.', status: 'open', posted_at: '2026-06-10' },
  { id: 'cr5', title: 'DevOps Engineer', slug: 'devops-engineer', department: 'DevOps', location: 'Remote', employment_type: 'full_time', experience_required: '4+ years', description: 'Automate CI/CD pipelines and container orchestration.', status: 'closed', posted_at: '2026-05-30' },
];

export const demoApplications = [
  { id: 'app1', career_id: 'cr1', full_name: 'Arjun Mehta', email: 'arjun@example.com', phone: '+91-98100-10001', status: 'applied', created_at: '2026-07-06T09:15:00Z' },
  { id: 'app2', career_id: 'cr1', full_name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91-98100-10002', status: 'shortlisted', created_at: '2026-07-05T14:30:00Z' },
  { id: 'app3', career_id: 'cr2', full_name: 'Rahul Verma', email: 'rahul.v@example.com', phone: '+91-98100-10003', status: 'interview', created_at: '2026-07-04T11:20:00Z' },
  { id: 'app4', career_id: 'cr2', full_name: 'Sneha Iyer', email: 'sneha@example.com', phone: '+91-98100-10004', status: 'offered', created_at: '2026-07-02T10:05:00Z' },
  { id: 'app5', career_id: 'cr3', full_name: 'David Wilson', email: 'david.w@example.com', phone: '+971-55-100-1005', status: 'hired', created_at: '2026-06-28T16:40:00Z' },
  { id: 'app6', career_id: 'cr4', full_name: 'Kavya Reddy', email: 'kavya@example.com', phone: '+91-98100-10006', status: 'rejected', created_at: '2026-06-27T12:00:00Z' },
];

export const demoTestimonials = [
  { id: 'tsm1', author_name: 'Jordan Lee', author_title: 'VP Engineering', company_name: 'Acme Retail', rating: 5, content: 'CoreFusion rebuilt our e-commerce platform end-to-end. Their engineering team shipped ahead of schedule and the new system scaled through our busiest season without a hitch.', is_published: false },
  { id: 'tsm2', author_name: 'Casey Kim', author_title: 'Chief Technology Officer', company_name: 'Northwind Logistics', rating: 4, content: 'The data warehouse migration was complex, but CoreFusion broke it down into clear phases and delivered reliable reporting in weeks.', is_published: false },
  { id: 'tsm3', author_name: 'Alex Rivera', author_title: 'Head of Digital', company_name: 'BlueSky Health', rating: 5, content: 'From discovery to launch, the patient portal redesign was smooth. The team genuinely understands healthcare compliance and user experience.', is_published: false },
  { id: 'tsm4', author_name: 'Priya Sharma', author_title: 'Operations Director', company_name: 'FinTech Ltd', rating: 5, content: 'CoreFusion delivered a secure payment gateway integration with rigorous testing. Our transaction error rates dropped by 40%.', is_published: true },
  { id: 'tsm5', author_name: 'Tom Becker', author_title: 'IT Manager', company_name: 'MedCare Inc', rating: 5, content: 'Professional, responsive, and technically excellent. The cloud migration was seamless with zero downtime.', is_published: true },
];

export const demoDashboard = {
  total_employees: 285,
  total_clients: 120,
  total_projects: 430,
  active_projects: 68,
  open_tasks: 245,
  total_revenue: 12500000,
  open_tickets: 23,
  new_applications: 45,
  unresolved_contacts: 12,
  published_blogs: 89,
};

export const demoClientPayments = [
  { id: 'PAY-001', invoice: 'INV-001', amount: 120000, method: 'Bank Transfer', date: '2026-06-28', status: 'completed' },
  { id: 'PAY-002', invoice: 'INV-003', amount: 100000, method: 'Wire Transfer', date: '2026-06-10', status: 'completed' },
  { id: 'PAY-003', invoice: 'INV-002', amount: 85000, method: 'Bank Transfer', date: '2026-07-20', status: 'pending' },
];

export const demoClientFiles = [
  { id: 'FILE-001', name: 'Project Proposal — Core Banking.pdf', category: 'Proposal', size: '1.2 MB', uploadedOn: '2026-01-15', uploadedBy: 'CoreFusion Team' },
  { id: 'FILE-002', name: 'SRS Document v2.1.pdf', category: 'Specification', size: '3.4 MB', uploadedOn: '2026-02-20', uploadedBy: 'CoreFusion Team' },
  { id: 'FILE-003', name: 'Q2 Progress Report.pdf', category: 'Report', size: '890 KB', uploadedOn: '2026-07-01', uploadedBy: 'CoreFusion Team' },
  { id: 'FILE-004', name: 'NDA — Acme Corp.pdf', category: 'Legal', size: '210 KB', uploadedOn: '2025-12-10', uploadedBy: 'Legal Dept' },
  { id: 'FILE-005', name: 'API Integration Guide.pdf', category: 'Technical', size: '2.1 MB', uploadedOn: '2026-04-05', uploadedBy: 'CoreFusion Team' },
];

export const demoClientMeetings = [
  { id: 'MTG-001', title: 'Q3 Project Review', date: '2026-07-15', time: '10:00 AM', duration: '1 hr', type: 'Video Call', attendees: ['John Smith', 'Sarah Lee', 'Dev Team'], status: 'upcoming' },
  { id: 'MTG-002', title: 'Payment Reconciliation', date: '2026-07-22', time: '2:00 PM', duration: '30 min', type: 'Video Call', attendees: ['John Smith', 'Finance Team'], status: 'upcoming' },
  { id: 'MTG-003', title: 'Sprint 8 Kickoff', date: '2026-07-01', time: '9:00 AM', duration: '1 hr', type: 'Video Call', attendees: ['John Smith', 'Dev Team'], status: 'completed' },
  { id: 'MTG-004', title: 'Requirements Gathering', date: '2026-06-10', time: '11:00 AM', duration: '2 hrs', type: 'On-site', attendees: ['John Smith', 'Jane Doe', 'BA Team'], status: 'completed' },
];

export const demoClientReports = [
  { id: 'RPT-001', title: 'Q2 2026 Project Status Report', type: 'Project', period: 'Q2 2026', generatedOn: '2026-07-01', size: '1.8 MB' },
  { id: 'RPT-002', title: 'Q2 2026 Financial Summary', type: 'Financial', period: 'Q2 2026', generatedOn: '2026-07-01', size: '950 KB' },
  { id: 'RPT-003', title: 'Q1 2026 Project Status Report', type: 'Project', period: 'Q1 2026', generatedOn: '2026-04-02', size: '1.5 MB' },
  { id: 'RPT-004', title: 'Q1 2026 Financial Summary', type: 'Financial', period: 'Q1 2026', generatedOn: '2026-04-02', size: '870 KB' },
  { id: 'RPT-005', title: 'Annual Report 2025', type: 'Annual', period: 'FY 2025', generatedOn: '2026-01-15', size: '4.2 MB' },
];

export const demoProjectStatusBreakdown = [
  { status: 'planning', count: 15 },
  { status: 'in_progress', count: 42 },
  { status: 'on_hold', count: 8 },
  { status: 'completed', count: 365 },
];
