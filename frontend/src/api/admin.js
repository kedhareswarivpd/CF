import { apiRequest, toQueryString, API_URL } from './client.js';

// ── Dashboard ──────────────────────────────────────────────────────────────
export const fetchDashboardOverview      = (token)         => apiRequest('/dashboard/overview', { token });
export const fetchProjectStatusBreakdown = (token)         => apiRequest('/dashboard/projects/status-breakdown', { token });

// ── Users ──────────────────────────────────────────────────────────────────
export const fetchUsers  = (token, p = {}) => apiRequest(`/users${toQueryString(p)}`, { token });
export const createUser  = (token, body)   => apiRequest('/users', { method: 'POST', body, token });
export const updateUser  = (token, id, b)  => apiRequest(`/users/${id}`, { method: 'PUT', body: b, token });
export const deactivateUser = (token, id)  => apiRequest(`/users/${id}/deactivate`, { method: 'PATCH', token });
export const deleteUser  = (token, id)     => apiRequest(`/users/${id}`, { method: 'DELETE', token });

// ── Employees ──────────────────────────────────────────────────────────────
export const fetchEmployees = (token, p = {}) => apiRequest(`/employees${toQueryString(p)}`, { token });

// ── Leave & timesheet approval (HR / PM) ─────────────────────────────────────
export const fetchLeaves       = (token, p = {}) => apiRequest(`/employees/leaves${toQueryString(p)}`, { token });
export const reviewLeave       = (token, id, status) => apiRequest(`/employees/leaves/${id}/approve`, { method: 'PATCH', body: { status }, token });
export const fetchAllTimesheets = (token, p = {}) => apiRequest(`/employees/timesheets${toQueryString(p)}`, { token });
export const reviewTimesheet   = (token, id, status) => apiRequest(`/employees/timesheets/${id}/approve`, { method: 'PATCH', body: { status }, token });

// ── Recruitment (HR) ──────────────────────────────────────────────────────────
export const fetchApplications = (token, p = {}) => apiRequest(`/careers/admin/applications${toQueryString(p)}`, { token });
export const updateApplicationStatus = (token, id, status) => apiRequest(`/careers/admin/applications/${id}/status`, { method: 'PATCH', body: { status }, token });

// ── Tickets (Support) ─────────────────────────────────────────────────────────
export const fetchTickets   = (token, p = {}) => apiRequest(`/tickets${toQueryString(p)}`, { token });
export const updateTicket   = (token, id, b)  => apiRequest(`/tickets/${id}`, { method: 'PATCH', body: b, token });
export const replyToTicket  = (token, id, b)  => apiRequest(`/tickets/${id}/replies`, { method: 'POST', body: b, token });

// ── Finance (Invoices & Payments) ──────────────────────────────────────────────
export const fetchInvoices  = (token, p = {}) => apiRequest(`/finance/invoices${toQueryString(p)}`, { token });
export const createInvoice  = (token, body)   => apiRequest('/finance/invoices', { method: 'POST', body, token });
export const updateInvoice  = (token, id, b)  => apiRequest(`/finance/invoices/${id}`, { method: 'PUT', body: b, token });
export const recordPayment  = (token, invoiceId, body) => apiRequest(`/finance/invoices/${invoiceId}/payments`, { method: 'POST', body, token });

// ── Testimonials (Marketing moderation) ────────────────────────────────────────
export const fetchTestimonials = (token, p = {}) => apiRequest(`/testimonials${toQueryString(p)}`, { token });
export const createTestimonial = (token, body)  => apiRequest('/testimonials', { method: 'POST', body, token });
export const updateTestimonial = (token, id, b)  => apiRequest(`/testimonials/${id}`, { method: 'PUT', body: b, token });
export const deleteTestimonial = (token, id)     => apiRequest(`/testimonials/${id}`, { method: 'DELETE', token });

// ── Tasks (QA / PM) ────────────────────────────────────────────────────────────
export const fetchTasks       = (token, p = {}) => apiRequest(`/tasks${toQueryString(p)}`, { token });
export const createTask       = (token, body)   => apiRequest('/tasks', { method: 'POST', body, token });
export const updateTaskStatus = (token, id, status) => apiRequest(`/tasks/${id}/status`, { method: 'PATCH', body: { status }, token });

// ── Project team assignment (PM) ────────────────────────────────────────────────
export const assignProjectTeam = (token, id, employeeIds) => apiRequest(`/projects/${id}/team`, { method: 'PATCH', body: { employee_ids: employeeIds }, token });

// ── Departments (Super Admin) ──────────────────────────────────────────────────
export const fetchDepartments = (token, p = {}) => apiRequest(`/departments${toQueryString(p)}`, { token });
export const createDepartment = (token, body)   => apiRequest('/departments', { method: 'POST', body, token });
export const deleteDepartment = (token, id)     => apiRequest(`/departments/${id}`, { method: 'DELETE', token });

// ── GDPR — act on behalf of another user (Super Admin) ──────────────────────────
export const exportUserData   = (token, userId) => apiRequest(`/users/${userId}/export`, { token });
export const anonymizeUser    = (token, userId) => apiRequest(`/users/${userId}/anonymize`, { method: 'POST', token });

// ── Clients ────────────────────────────────────────────────────────────────
export const fetchClients = (token, p = {}) => apiRequest(`/clients${toQueryString(p)}`, { token });

// ── Projects ───────────────────────────────────────────────────────────────
export const fetchAdminProjects = (token, p = {}) => apiRequest(`/projects${toQueryString(p)}`, { token });
export const createProject      = (token, body)   => apiRequest('/projects', { method: 'POST', body, token });
export const updateProject      = (token, id, b)  => apiRequest(`/projects/${id}`, { method: 'PUT', body: b, token });
export const deleteProject      = (token, id)     => apiRequest(`/projects/${id}`, { method: 'DELETE', token });

// ── Roles & Permissions ────────────────────────────────────────────────────
export const fetchRoles       = (token, p = {}) => apiRequest(`/access-control/roles${toQueryString(p)}`, { token });
export const createRole       = (token, body)   => apiRequest('/access-control/roles', { method: 'POST', body, token });
export const deleteRole       = (token, id)     => apiRequest(`/access-control/roles/${id}`, { method: 'DELETE', token });
export const fetchPermissions = (token, p = {}) => apiRequest(`/access-control/permissions${toQueryString(p)}`, { token });
export const createPermission = (token, body)   => apiRequest('/access-control/permissions', { method: 'POST', body, token });
export const deletePermission = (token, id)     => apiRequest(`/access-control/permissions/${id}`, { method: 'DELETE', token });

// ── Analytics ──────────────────────────────────────────────────────────────
export const fetchAnalyticsSummary = (token) => apiRequest('/analytics/summary', { token });
export const trackPageView = (data) => apiRequest('/analytics/track', { method: 'POST', body: data });

// ── Media ──────────────────────────────────────────────────────────────────
export const fetchMedia       = (token, p = {}) => apiRequest(`/media${toQueryString(p)}`, { token });
export const deleteMedia      = (token, id)     => apiRequest(`/media/${id}`, { method: 'DELETE', token });

/** Multipart file upload — uses apiRequest so cookies/CSRF are handled the same as every other request. */
export function uploadMedia(token, files, folder = 'misc') {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  formData.append('folder', folder);
  return apiRequest('/media/upload', { method: 'POST', body: formData, token });
}

// ── Notifications ──────────────────────────────────────────────────────────
export const fetchNotifications = (token)     => apiRequest('/notifications', { token });
export const markNotificationRead = (token, id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH', token });
export const markAllNotificationsRead = (token) => apiRequest('/notifications/read-all', { method: 'PATCH', token });
export const createNotification = (token, body) => apiRequest('/notifications', { method: 'POST', body, token });

// ── Blog comment moderation ─────────────────────────────────────────────────
export const fetchComments  = (token, p = {}) => apiRequest(`/comments${toQueryString(p)}`, { token });
export const moderateComment = (token, id, status) => apiRequest(`/comments/${id}`, { method: 'PATCH', body: { status }, token });
export const deleteComment  = (token, id)     => apiRequest(`/comments/${id}`, { method: 'DELETE', token });

// ── Newsletter subscribers (admin view) ─────────────────────────────────────
export const fetchNewsletterSubscribers = (token, p = {}) => apiRequest(`/newsletter${toQueryString(p)}`, { token });

// ── Training courses (admin/hr create — no update/delete endpoint exists) ──
export const fetchCourses = (token, p = {}) => apiRequest(`/trainings/courses${toQueryString({ limit: 100, ...p })}`, { token });
export const createCourse = (token, body)   => apiRequest('/trainings/courses', { method: 'POST', body, token });

// ── Reports ────────────────────────────────────────────────────────────────
export const fetchReports  = (token, p = {}) => apiRequest(`/reports${toQueryString(p)}`, { token });
export const generateReport = (token, body)  => apiRequest('/reports/generate', { method: 'POST', body, token });
export const deleteReport  = (token, id)     => apiRequest(`/reports/${id}`, { method: 'DELETE', token });

// ── Contact Submissions ──────────────────────────────────────────────────────
export const fetchContactSubmissions = (token, p = {}) => apiRequest(`/contact${toQueryString(p)}`, { token });
export const updateContactStatus = (token, id, status) => apiRequest(`/contact/${id}`, { method: 'PATCH', body: { status }, token });

// ── Audit Logs ─────────────────────────────────────────────────────────────
export const fetchAuditLogs = (token, p = {}) => apiRequest(`/audit-logs${toQueryString(p)}`, { token });

// ── SEO Metadata ───────────────────────────────────────────────────────────
export const fetchSeoEntries = (token, p = {}) => apiRequest(`/seo${toQueryString({ limit: 100, ...p })}`, { token });
export const createSeoEntry  = (token, body)   => apiRequest('/seo', { method: 'POST', body, token });
export const updateSeoEntry  = (token, id, b)  => apiRequest(`/seo/${id}`, { method: 'PUT', body: b, token });
export const deleteSeoEntry  = (token, id)     => apiRequest(`/seo/${id}`, { method: 'DELETE', token });

// ── Settings (key-based, not id-based — GET list, PUT upserts by key) ──────
export const fetchSettings = (token, p = {}) => apiRequest(`/settings${toQueryString(p)}`, { token });
export const upsertSetting = (token, key, body) => apiRequest(`/settings/${encodeURIComponent(key)}`, { method: 'PUT', body, token });
export const deleteSetting = (token, key)     => apiRequest(`/settings/${encodeURIComponent(key)}`, { method: 'DELETE', token });

// ── Backups (Super Admin only server-side) ──────────────────────────────────
export const fetchBackups   = (token)         => apiRequest('/backups', { token });
export const triggerBackup  = (token)         => apiRequest('/backups/trigger', { method: 'POST', token });
export const deleteBackup   = (token, filename) => apiRequest(`/backups/${encodeURIComponent(filename)}`, { method: 'DELETE', token });
export const backupDownloadUrl = (filename)   => `${API_URL}/backups/${encodeURIComponent(filename)}/download`;
