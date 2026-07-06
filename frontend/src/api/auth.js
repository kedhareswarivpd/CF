import { apiRequest } from './client.js';

export function login(email, password) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(name, email, password) {
  return apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function fetchCurrentUser(token) {
  return apiRequest('/auth/me', { token });
}

export function logout(accessToken) {
  return apiRequest('/auth/logout', { method: 'POST', body: { access_token: accessToken } });
}
