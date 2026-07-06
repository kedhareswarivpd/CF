import { apiRequest, toQueryString } from './client.js';

export function fetchMyProfile(token) {
  return apiRequest('/clients/me/profile', { token });
}

export function fetchMyProjects(token) {
  return apiRequest('/clients/me/projects', { token });
}

export function fetchMyInvoices(token) {
  return apiRequest('/clients/me/invoices', { token });
}

export function fetchMyTickets(token) {
  return apiRequest('/clients/me/tickets', { token });
}

export function createTicket(token, payload) {
  return apiRequest('/clients/me/tickets', { method: 'POST', token, body: payload });
}
