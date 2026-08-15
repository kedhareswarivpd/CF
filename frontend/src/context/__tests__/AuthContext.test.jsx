import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(),
      setSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('../../api/auth.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../../api/auth.js';

describe('useAuth', () => {
  it('returns default values when used outside provider', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });
});

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('initializes with no session', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('initializes with existing session', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { access_token: 'token', user: mockUser };
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.accessToken).toBe('token');
  });

  it('login calls API and sets session', async () => {
    loginApi.mockResolvedValue({
      data: { access_token: 'access', refresh_token: 'refresh', user: { id: '1' } },
    });
    supabase.auth.setSession.mockResolvedValue({
      data: { session: { access_token: 'access' } },
      error: null,
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(loginApi).toHaveBeenCalledWith('test@example.com', 'password');
    expect(supabase.auth.setSession).toHaveBeenCalledWith({
      access_token: 'access',
      refresh_token: 'refresh',
    });
  });

  it('login throws on missing tokens', async () => {
    loginApi.mockResolvedValue({ data: {} });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await expect(result.current.login('test@example.com', 'password')).rejects.toThrow('Login failed');
  });

  it('register calls Supabase signUp', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '1' }, session: { access_token: 'token' } },
      error: null,
    });
    registerApi.mockResolvedValue({});

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password');
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: { data: { name: 'Test User', role: 'client' } },
    });
  });

  it('register throws on Supabase error', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already exists' },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await expect(
      result.current.register('Test', 'test@example.com', 'password')
    ).rejects.toThrow('Email already exists');
  });

  it('logout calls API and Supabase signOut', async () => {
    const mockSession = { access_token: 'token', user: { id: '1' } };
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    logoutApi.mockResolvedValue({});
    supabase.auth.signOut.mockResolvedValue({});

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutApi).toHaveBeenCalledWith('token');
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
