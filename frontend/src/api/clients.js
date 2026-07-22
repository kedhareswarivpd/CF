import { apiRequest } from './client.js';

export const fetchMyProfile  = (token) => apiRequest('/clients/me/profile',  { token });
export const fetchMyProjects = (token) => apiRequest('/clients/me/projects',  { token });
export const fetchMyInvoices = (token) => apiRequest('/clients/me/invoices',  { token });
export const fetchMyTickets  = (token) => apiRequest('/clients/me/tickets',   { token });
export const fetchMyPayments = (token) => apiRequest('/clients/me/payments',  { token });
export const fetchMyMeetings = (token) => apiRequest('/clients/me/meetings',  { token });
export const fetchMyFiles    = (token) => apiRequest('/clients/me/files',     { token });
export const fetchMyReports  = (token) => apiRequest('/clients/me/reports',   { token });
export const createTicket    = (token, payload) => apiRequest('/clients/me/tickets', { method: 'POST', token, body: payload });
