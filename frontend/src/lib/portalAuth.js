import { supabase } from './supabase.js';
import { fetchCurrentUser } from '../api/auth.js';

const ROLE_LABELS = {
  client: 'Client',
  employee: 'Employee',
  developer: 'Developer',
  sales: 'Sales',
  marketing: 'Marketing',
  project_manager: 'Project Manager',
  qa: 'QA',
  support: 'Support',
  finance: 'Finance',
  hr: 'HR',
  admin: 'Admin',
  super_admin: 'Super Admin',
  guest: 'Guest',
};

export class PortalAccessError extends Error {}

/**
 * Signs in via `login(email, password)`, then confirms the account's actual
 * `users.role` (from the backend, not client-trusted metadata) is one of
 * `allowedRoles` for the portal being entered. Signs the session back out and
 * throws if it doesn't match, so a Client account can never land inside the
 * Employee/Admin/Super Admin portals (and vice versa) even though every
 * portal shares the same Supabase login.
 *
 * Returns the verified role on success.
 */
export async function loginToPortal(login, email, password, allowedRoles) {
  await login(email, password);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new PortalAccessError('Login failed. Please try again.');

  let role;
  try {
    const me = await fetchCurrentUser(session.access_token);
    role = me?.data?.role;
  } catch (err) {
    await supabase.auth.signOut();
    throw new PortalAccessError(err.message || 'Could not verify this account.');
  }

  if (!allowedRoles.includes(role)) {
    await supabase.auth.signOut();
    const roleLabel = ROLE_LABELS[role] || role || 'This account';
    throw new PortalAccessError(`${roleLabel} accounts don't have access to this portal.`);
  }

  return role;
}
