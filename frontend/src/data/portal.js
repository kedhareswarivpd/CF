export const clientPortalTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'invoices', label: 'Invoices', icon: 'receipt' },
  { id: 'tickets', label: 'Support Tickets', icon: 'support' },
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

export const adminPanelTabs = [
  { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
  { id: 'content', label: 'Content', icon: 'article' },
  { id: 'users', label: 'Users', icon: 'people' },
  { id: 'employees', label: 'Employees', icon: 'badge' },
  { id: 'clients', label: 'Clients', icon: 'business' },
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

export const demoEmployeeProfile = {
  employee_code: 'EMP-001',
  name: 'Priya Sharma',
  email: 'priya@corefusiontech.com',
  designation: 'Senior Software Engineer',
  department: 'Engineering',
  status: 'active',
};

export const demoAttendance = { date: '2026-07-04', checkIn: '09:02 AM', checkOut: '06:15 PM', status: 'present' };

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

export const demoProjectStatusBreakdown = [
  { status: 'planning', count: 15 },
  { status: 'in_progress', count: 42 },
  { status: 'on_hold', count: 8 },
  { status: 'completed', count: 365 },
];
