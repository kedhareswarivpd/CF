import { apiRequest, toQueryString, API_URL, ApiRequestError } from './client.js';

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
export const fetchTicket    = (token, id)     => apiRequest(`/tickets/${id}`, { token });
export const updateTicket   = (token, id, b)  => apiRequest(`/tickets/${id}`, { method: 'PATCH', body: b, token });
export const replyToTicket  = (token, id, b)  => apiRequest(`/tickets/${id}/replies`, { method: 'POST', body: b, token });

// ── Finance (Invoices & Payments) ──────────────────────────────────────────────
export const fetchInvoices  = (token, p = {}) => apiRequest(`/finance/invoices${toQueryString(p)}`, { token });
export const createInvoice  = (token, body)   => apiRequest('/finance/invoices', { method: 'POST', body, token });
export const updateInvoice  = (token, id, b)  => apiRequest(`/finance/invoices/${id}`, { method: 'PUT', body: b, token });
export const recordPayment  = (token, invoiceId, body) => apiRequest(`/finance/invoices/${invoiceId}/payments`, { method: 'POST', body, token });

// ── Testimonials (Marketing moderation) ────────────────────────────────────────
export const fetchTestimonials = (token, p = {}) => apiRequest(`/testimonials${toQueryString(p)}`, { token });
export const updateTestimonial = (token, id, b)  => apiRequest(`/testimonials/${id}`, { method: 'PUT', body: b, token });

// ── Tasks (QA / PM) ────────────────────────────────────────────────────────────
export const fetchTasks       = (token, p = {}) => apiRequest(`/tasks${toQueryString(p)}`, { token });
export const createTask       = (token, body)   => apiRequest('/tasks', { method: 'POST', body, token });
export const updateTask       = (token, id, b)  => apiRequest(`/tasks/${id}`, { method: 'PUT', body: b, token });
export const updateTaskStatus = (token, id, status) => apiRequest(`/tasks/${id}/status`, { method: 'PATCH', body: { status }, token });

// ── Project team assignment (PM) ────────────────────────────────────────────────
export const assignProjectTeam = (token, id, employeeIds) => apiRequest(`/projects/${id}/team`, { method: 'PATCH', body: { employee_ids: employeeIds }, token });

// ── Departments (Super Admin) ──────────────────────────────────────────────────
export const fetchDepartments = (token, p = {}) => apiRequest(`/departments${toQueryString(p)}`, { token });
export const createDepartment = (token, body)   => apiRequest('/departments', { method: 'POST', body, token });
export const updateDepartment = (token, id, b)  => apiRequest(`/departments/${id}`, { method: 'PUT', body: b, token });
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
export const updateRole       = (token, id, b)  => apiRequest(`/access-control/roles/${id}`, { method: 'PUT', body: b, token });
export const deleteRole       = (token, id)     => apiRequest(`/access-control/roles/${id}`, { method: 'DELETE', token });
export const fetchPermissions = (token, p = {}) => apiRequest(`/access-control/permissions${toQueryString(p)}`, { token });
export const createPermission = (token, body)   => apiRequest('/access-control/permissions', { method: 'POST', body, token });
export const deletePermission = (token, id)     => apiRequest(`/access-control/permissions/${id}`, { method: 'DELETE', token });

// ── Analytics ──────────────────────────────────────────────────────────────
export const fetchAnalyticsSummary = (token) => apiRequest('/analytics/summary', { token });

// ── Media ──────────────────────────────────────────────────────────────────
export const fetchMedia       = (token, p = {}) => apiRequest(`/media${toQueryString(p)}`, { token });
export const deleteMedia      = (token, id)     => apiRequest(`/media/${id}`, { method: 'DELETE', token });

/** Multipart file upload — bypasses apiRequest's JSON-only body encoding. */
export async function uploadMedia(token, files, folder = 'misc') {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  formData.append('folder', folder);

  let response;
  try {
    response = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (networkError) {
    throw new ApiRequestError('Could not reach the CoreFusion API. Is the backend running?', 0, [{ field: null, message: networkError.message }]);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(payload?.message || response.statusText || 'Upload failed', response.status, payload?.errors || []);
  }
  return payload;
}

// ── Notifications ──────────────────────────────────────────────────────────
export const fetchNotifications = (token)     => apiRequest('/notifications', { token });
export const markNotificationRead = (token, id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH', token });
export const markAllNotificationsRead = (token) => apiRequest('/notifications/read-all', { method: 'PATCH', token });

// ── Reports ────────────────────────────────────────────────────────────────
export const fetchReports  = (token, p = {}) => apiRequest(`/reports${toQueryString(p)}`, { token });
export const generateReport = (token, body)  => apiRequest('/reports/generate', { method: 'POST', body, token });
export const deleteReport  = (token, id)     => apiRequest(`/reports/${id}`, { method: 'DELETE', token });

// ── Settings ───────────────────────────────────────────────────────────────
export const fetchSettings  = (token)          => apiRequest('/settings', { token });
export const upsertSetting  = (token, key, body) => apiRequest(`/settings/${key}`, { method: 'PUT', body, token });

// ── Audit Logs ─────────────────────────────────────────────────────────────
export const fetchAuditLogs = (token, p = {}) => apiRequest(`/audit-logs${toQueryString(p)}`, { token });

// ── Notifications (compose/broadcast) ───────────────────────────────────────
export const createNotification = (token, body) => apiRequest('/notifications', { method: 'POST', body, token });

// ── Content management (Services, Solutions, Case Studies, Blog, Events, Downloads) ──
function contentCrud(path) {
  return {
    fetch:  (token, p = {}) => apiRequest(`${path}${toQueryString(p)}`, { token }),
    create: (token, body)   => apiRequest(path, { method: 'POST', body, token }),
    update: (token, id, b)  => apiRequest(`${path}/${id}`, { method: 'PUT', body: b, token }),
    delete: (token, id)     => apiRequest(`${path}/${id}`, { method: 'DELETE', token }),
  };
}

export const servicesAdmin    = contentCrud('/services');
export const solutionsAdmin   = contentCrud('/solutions');
export const caseStudiesAdmin = contentCrud('/case-studies');
export const blogsAdmin       = contentCrud('/blogs');
export const eventsAdmin      = contentCrud('/events');
export const downloadsAdmin   = contentCrud('/downloads');
