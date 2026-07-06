import { apiRequest, toQueryString } from './client.js';

export function fetchDashboardOverview(token) {
  return apiRequest('/dashboard/overview', { token });
}

export function fetchProjectStatusBreakdown(token) {
  return apiRequest('/dashboard/projects/status-breakdown', { token });
}

export function fetchUsers(token, params = {}) {
  return apiRequest(`/users${toQueryString(params)}`, { token });
}

export function fetchEmployees(token, params = {}) {
  return apiRequest(`/employees${toQueryString(params)}`, { token });
}

export function fetchClients(token, params = {}) {
  return apiRequest(`/clients${toQueryString(params)}`, { token });
}
