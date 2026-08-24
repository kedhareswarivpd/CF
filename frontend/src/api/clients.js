import { apiRequest } from './client.js';

export const fetchMyProfile  = () => apiRequest('/clients/me/profile',  {});
export const fetchMyProjects = () => apiRequest('/clients/me/projects',  {});
export const fetchMyInvoices = () => apiRequest('/clients/me/invoices',  {});
export const fetchMyTickets  = () => apiRequest('/clients/me/tickets',   {});
export const fetchMyPayments = () => apiRequest('/clients/me/payments',  {});
export const fetchMyMeetings = () => apiRequest('/clients/me/meetings',  {});
export const fetchMyFiles    = () => apiRequest('/clients/me/files',     {});
export const fetchMyReports  = () => apiRequest('/clients/me/reports',   {});
export const createTicket    = (payload) => apiRequest('/clients/me/tickets', { method: 'POST', body: payload });
