import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_SETS = {
  admin: ['admin', 'super_admin'],
  super_admin: ['super_admin'],
  employee: ['employee', 'developer', 'sales', 'marketing', 'project_manager', 'qa', 'support', 'finance', 'hr', 'admin', 'super_admin'],
  client: ['client'],
};

/**
 * Client-side role guard for portal routes. The backend remains the source of
 * truth (every protected endpoint re-checks the role via `require_roles`);
 * this hook only improves UX by redirecting clearly-wrong roles immediately.
 * If role metadata is absent (e.g. legacy accounts), the page is allowed to
 * render and the backend enforces access.
 */
export function useRoleGuard(portalKey, redirectTo = '/login') {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  const role = user?.user_metadata?.role ?? user?.app_metadata?.role ?? null;
  const allowed = ROLE_SETS[portalKey] || [];
  const denied = Boolean(!initializing && user && role && !allowed.includes(role));

  useEffect(() => {
    if (denied) {
      navigate(redirectTo, { replace: true });
    }
  }, [denied, navigate, redirectTo]);

  return { role, denied, isAllowed: !denied };
}
