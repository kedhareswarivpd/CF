const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiRequestError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Low-level request helper. Returns the parsed `{ success, data, message, meta }`
 * envelope the FastAPI backend sends back (see app/utils/responses.py).
 * When `body` is a FormData instance it is sent as-is (multipart) — the browser
 * sets the boundary, so no Content-Type is forced.
 */
export async function apiRequest(path, { method = 'GET', body, token, headers, signal } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // No/invalid JSON body (e.g. 204 No Content) — that's fine for some requests.
  }

  if (!response.ok) {
    throw new ApiRequestError(
      payload?.message || response.statusText || 'Request failed',
      response.status,
      payload?.errors || []
    );
  }

  return payload;
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
