import { apiRequest } from './client.js';

// Partner Portal self-service (backend/app/routers/partner_account.py) —
// deliberately distinct from api/cms.js's `partnersApi`, which manages the
// unrelated public "our partners" logo listing (backend Partner/`/partners`
// CMS model). Naming them differently (partnerAccounts.js vs. cms.js's
// partnersApi) is intentional so the two are never confused at an import site.

export const fetchMyProfile = (token) => apiRequest('/partner-accounts/me/profile', { token });
export const updateMyProfile = (token, body) => apiRequest('/partner-accounts/me/profile', { method: 'PUT', body, token });
export const fetchMyFiles = (token) => apiRequest('/partner-accounts/me/files', { token });
export const fetchMyTickets = (token) => apiRequest('/partner-accounts/me/tickets', { token });
export const createTicket = (token, body) => apiRequest('/partner-accounts/me/tickets', { method: 'POST', body, token });
