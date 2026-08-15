import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { fetchCurrentUser } from '../api/auth.js';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const ROLE_PORTAL_MAP = {
  client: '/client',
  employee: '/employee',
  developer: '/developer',
  sales: '/sales',
  marketing: '/marketing',
  project_manager: '/project-manager',
  qa: '/qa',
  support: '/support',
  finance: '/finance',
  hr: '/hr',
  admin: '/admin',
  super_admin: '/super-admin',
};

export default function LoginPage() {
  useDocumentTitle('Sign In | CoreFusion Technologies');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Login failed. Please try again.');

      let role;
      try {
        const me = await fetchCurrentUser(session.access_token);
        role = me?.data?.role;
      } catch {
        await supabase.auth.signOut();
        throw new Error('Could not verify this account.');
      }

      const target = ROLE_PORTAL_MAP[role];
      if (!target) {
        await supabase.auth.signOut();
        throw new Error('Your account does not have access to any portal.');
      }

      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

  return (
    <div className="flex items-center justify-center bg-surface-container px-margin-mobile py-section-padding dark:bg-dark-surface-container">
      <div className="w-full max-w-sm rounded-lg bg-white p-stack-lg shadow-card-hover dark:bg-dark-surface">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand">
            <Icon name="login" className="text-[18px] leading-none text-white" />
          </div>
          <div>
            <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Sign In</h1>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Access your portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@corefusiontech.com"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>

          {error && (
            <p className="flex items-center gap-1 text-body-sm text-status-error-text">
              <Icon name="error" className="text-base" />{error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded bg-brand font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-semibold text-brand hover:underline">Create account</a>
          </p>
        </form>
      </div>
    </div>
  );
}
