import { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import {
 login as loginApi,
 register as registerApi,
 logout as logoutApi,
 fetchCurrentUser,
} from '../api/auth.js';

const AuthContext = createContext(null);

// CoreFusion self-auth: the backend owns identity/session/credentials via
// httpOnly `cf_access_token`/`cf_refresh_token` cookies (see
// backend/app/core/cookies.py) — this app never sees, stores, or reads
// either token. Session state is reconstructed purely from GET /auth/me on
// boot; there is no Supabase Auth, no localStorage/sessionStorage token, and
// no Authorization: Bearer header anywhere in this codebase.
//
// `accessToken` below is a deliberate compatibility shim, not a real
// credential: many existing components (ClientPortal, EmployeePortal,
// AdminPanel, SuperAdminPanel, ContentManager) gate data fetches on
// `if (!accessToken) return` and thread the value into api/*.js functions
// that accept a `token` argument. Since the real transport is now the
// browser's automatic cookie handling (`credentials: 'include'` in
// api/client.js, which ignores this value entirely), `accessToken` is set to
// a non-secret sentinel string while authenticated and `null` otherwise —
// preserving every existing truthy/falsy gate without threading a rewrite
// through those four large files. It holds no usable value and cannot be
// replayed anywhere.
const AUTHENTICATED_SENTINEL = 'cf-cookie-session';

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'anonymous' | 'error'

 const hydrate = useCallback(async () => {
  try {
   const res = await fetchCurrentUser();
   setUser(res?.data ?? null);
   setStatus(res?.data ? 'authenticated' : 'anonymous');
  } catch (err) {
   if (err?.status === 401) {
    setUser(null);
    setStatus('anonymous');
   } else {
    // Network/server error distinct from "not logged in" — don't claim
    // anonymous, since that would be indistinguishable from a real logout.
    setUser(null);
    setStatus('error');
   }
  }
 }, []);

 useEffect(() => {
  hydrate();
 }, [hydrate]);

 // A request that survived one silent refresh attempt and still came back
 // 401 (api/client.js) means the session is truly gone — clear local state
 // so the UI reflects it without waiting for the next /auth/me poll.
 useEffect(() => {
  const onUnauthorized = () => {
   setUser(null);
   setStatus('anonymous');
  };
  window.addEventListener('corefusion:unauthorized', onUnauthorized);
  return () => window.removeEventListener('corefusion:unauthorized', onUnauthorized);
 }, []);

 const register = useCallback(async (name, email, password) => {
  const res = await registerApi(name, email, password);
  return res?.data ?? null;
 }, []);

 const login = useCallback(async (email, password) => {
  const res = await loginApi(email, password);
  const data = res?.data;
  if (data?.mfa_token) {
   // MFA is off by default for every account (see backend
   // app/routers/auth.py) — this branch exists so a future MFA-enabled
   // account fails loudly instead of silently, rather than because the
   // frontend implements a verification step today.
   throw new Error('This account requires multi-factor verification, which is not yet supported here.');
  }
  if (!data?.user) {
   throw new Error('Login failed. Please try again.');
  }
  setUser(data.user);
  setStatus('authenticated');
  return data.user;
 }, []);

 const logout = useCallback(async () => {
  try {
   await logoutApi();
  } finally {
   setUser(null);
   setStatus('anonymous');
  }
 }, []);

 const value = useMemo(
  () => ({
   user,
   status,
   isAuthenticated: status === 'authenticated',
   isLoading: status === 'loading',
   initializing: status === 'loading',
   role: user?.role ?? null,
   accessToken: status === 'authenticated' ? AUTHENTICATED_SENTINEL : null,
   login,
   logout,
   register,
   refresh: hydrate,
  }),
  [user, status, login, logout, register, hydrate]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) {
  return {
   user: null,
   status: 'anonymous',
   isAuthenticated: false,
   isLoading: false,
   initializing: false,
   role: null,
   accessToken: null,
   login: async () => null,
   logout: async () => {},
   register: async () => null,
   refresh: async () => {},
  };
 }
 return ctx;
}
