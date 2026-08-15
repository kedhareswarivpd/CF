import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, toQueryString, ApiRequestError, API_URL } from '../client.js';

describe('ApiRequestError', () => {
  it('creates error with message, status, and errors', () => {
    const error = new ApiRequestError('Not found', 404, [{ field: 'id', message: 'Invalid' }]);
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.errors).toEqual([{ field: 'id', message: 'Invalid' }]);
    expect(error.name).toBe('ApiRequestError');
  });

  it('creates error with default empty errors', () => {
    const error = new ApiRequestError('Error', 500);
    expect(error.errors).toEqual([]);
  });
});

describe('apiRequest', () => {
  let mockFetch;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    Object.defineProperty(globalThis, 'fetch', {
      value: mockFetch,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'fetch', {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
  });

  it('returns payload on successful request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 1 } }),
    });

    const result = await apiRequest('/test');
    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it('sends GET request by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('sends POST request when specified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test', { method: 'POST', body: { name: 'test' } });
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes Authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test', { token: 'my-token' });
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      })
    );
  });

  it('does not include Authorization header when no token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test');
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBeUndefined();
  });

  it('throws ApiRequestError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
    });

    const error = await apiRequest('/missing').catch((e) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('throws ApiRequestError with statusText when no JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('No JSON'); },
    });

    await expect(apiRequest('/error')).rejects.toThrow(ApiRequestError);
  });

  it('throws ApiRequestError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const error = await apiRequest('/test').catch((e) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(0);
  });

  it('handles empty response body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const result = await apiRequest('/test');
    expect(result).toBeNull();
  });

  it('stringifies body when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test', { method: 'POST', body: { key: 'value' } });
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.body).toBe(JSON.stringify({ key: 'value' }));
  });

  it('does not stringify body when undefined', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiRequest('/test');
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.body).toBeUndefined();
  });

  it('sends FormData as-is without forcing Content-Type', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const formData = new FormData();
    formData.append('full_name', 'Jane Doe');
    await apiRequest('/careers/123/apply', { method: 'POST', body: formData });
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.body).toBe(formData);
    expect(callArgs.headers['Content-Type']).toBeUndefined();
  });
});

describe('toQueryString', () => {
  it('returns empty string for empty params', () => {
    expect(toQueryString({})).toBe('');
  });

  it('builds query string from params', () => {
    const result = toQueryString({ page: 1, limit: 20 });
    expect(result).toBe('?page=1&limit=20');
  });

  it('skips null values', () => {
    const result = toQueryString({ page: 1, search: null });
    expect(result).toBe('?page=1');
  });

  it('skips undefined values', () => {
    const result = toQueryString({ page: 1, search: undefined });
    expect(result).toBe('?page=1');
  });

  it('skips empty string values', () => {
    const result = toQueryString({ page: 1, search: '' });
    expect(result).toBe('?page=1');
  });

  it('handles mixed valid and invalid values', () => {
    const result = toQueryString({ page: 1, search: null, sort: '-created_at' });
    expect(result).toContain('page=1');
    expect(result).toContain('sort=-created_at');
    expect(result).not.toContain('search');
  });
});
