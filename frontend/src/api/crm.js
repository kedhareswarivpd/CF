import { apiRequest, toQueryString } from './client.js';

// ---------- Leads ----------
export function fetchLeads(token, params = {}) {
  return apiRequest(`/leads${toQueryString(params)}`, { token });
}

export function createLead(token, payload) {
  return apiRequest('/leads', { method: 'POST', token, body: payload });
}

export function updateLead(token, leadId, payload) {
  return apiRequest(`/leads/${leadId}`, { method: 'PATCH', token, body: payload });
}

// ---------- Proposals ----------
export function fetchProposals(token, params = {}) {
  return apiRequest(`/proposals${toQueryString(params)}`, { token });
}

export function createProposal(token, payload) {
  return apiRequest('/proposals', { method: 'POST', token, body: payload });
}

export function sendProposal(token, proposalId) {
  return apiRequest(`/proposals/${proposalId}/send`, { method: 'POST', token });
}

export function acceptProposal(token, proposalId) {
  return apiRequest(`/proposals/${proposalId}/accept`, { method: 'POST', token });
}

export function rejectProposal(token, proposalId) {
  return apiRequest(`/proposals/${proposalId}/reject`, { method: 'POST', token });
}

// ---------- Contracts ----------
export function fetchContracts(token, params = {}) {
  return apiRequest(`/contracts${toQueryString(params)}`, { token });
}

export function createContract(token, proposalId) {
  return apiRequest('/contracts', { method: 'POST', token, body: { proposal_id: proposalId } });
}

export function signContract(token, contractId, payload = {}) {
  return apiRequest(`/contracts/${contractId}/sign`, { method: 'POST', token, body: payload });
}
