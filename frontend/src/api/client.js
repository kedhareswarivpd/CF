const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Cookie-based auth (CoreFusion self-auth): cf_access_token/cf_refresh_token
// are httpOnly and never touched by JS. cf_csrf_token is the one readable
// cookie — its value must be echoed back as X-CSRF-Token on every
// state-changing request (double-submit CSRF check, see backend
// app/core/csrf.py). There is no Authorization/Bearer header in this
// architecture; every request relies on `credentials: 'include'` instead.
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUTH_PATHS_EXEMPT_FROM_REFRESH = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']);

export class ApiRequestError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// A 401 from many in-flight requests must trigger exactly one refresh call,
// not one per request (refresh storm) — every caller awaits this same
// in-flight promise instead of starting its own.
let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': readCookie('cf_csrf_token') || '' },
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Low-level request helper. Returns the parsed `{ success, data, message, meta }`
 * envelope the FastAPI backend sends back (see app/utils/responses.py).
 * When `body` is a FormData instance it is sent as-is (multipart) — the browser
 * sets the boundary, so no Content-Type is forced.
 */
export async function apiRequest(path, { method = 'GET', body, headers, signal, _isRetry = false } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const upperMethod = method.toUpperCase();
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(MUTATING_METHODS.has(upperMethod) ? { 'X-CSRF-Token': readCookie('cf_csrf_token') || '' } : {}),
        ...headers,
      },
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    throw new ApiRequestError(
      'Could not reach the CoreFusion API. Is the backend running?',
      0,
      [{ field: null, message: networkError.message }]
    );
  }

  // Single retry after a silent refresh — never for the auth endpoints
  // themselves, which would otherwise refresh-loop.
  if (response.status === 401 && !_isRetry && !AUTH_PATHS_EXEMPT_FROM_REFRESH.has(path)) {
    try {
      const refreshResponse = await refreshSession();
      if (refreshResponse.ok) {
        return apiRequest(path, { method, body, headers, signal, _isRetry: true });
      }
    } catch {
      // Refresh itself unreachable — fall through to normal 401 handling below.
    }
    window.dispatchEvent(new CustomEvent('corefusion:unauthorized'));
  }

  const contentType = response.headers?.get?.('content-type') || '';

  if (!response.ok) {
    let errorBody = null;
    if (contentType.includes('application/json')) {
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }
    }

    if (!errorBody && contentType.includes('application/json') === false) {
      try {
        errorBody = await response.text();
      } catch {
        errorBody = '';
      }
    }

    throw new ApiRequestError(
      errorBody && typeof errorBody === 'object' && errorBody.message
        ? errorBody.message
        : response.statusText || `Request failed with status ${response.status}`,
      response.status,
      errorBody && typeof errorBody === 'object' ? (errorBody.errors || []) : []
    );
  }

  if (!contentType.includes('application/json')) {
    const bodyText = await response.text().catch(() => '');
    throw new ApiRequestError(
      `Expected JSON from ${API_URL}${path} but got ${contentType || 'non-JSON'} (HTTP ${response.status}). ` +
        (bodyText.trim().startsWith('<!doctype') || bodyText.trim().startsWith('<html')
          ? 'The SPA fallback (index.html) was returned instead of the API — check that VITE_API_URL is unset/"/api/v1" on the host and that the /api/v1 proxy rewrite is active.'
          : `Body preview: ${bodyText.slice(0, 200)}`),
      response.status,
      []
    );
  }

  return response.json();
}

/** Builds a query string from an object, skipping null/undefined/empty values. */
export function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export { API_URL };
