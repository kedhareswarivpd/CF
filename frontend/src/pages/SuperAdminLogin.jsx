import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function SuperAdminLogin() {
  useDocumentTitle('Super Admin Verification | CoreFusion Technologies');
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
      const userData = await login(email, password);
      const role = userData?.role;

      if (role !== 'super_admin') {
        throw new Error('Access denied. Only Super Admin accounts are allowed.');
      }

      navigate('/super-admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
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
            <Icon name="shield_person" className="text-[18px] leading-none text-white" />
          </div>
          <div>
            <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Super Admin Verification</h1>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Re-enter credentials to access the Super Admin portal</p>
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
              placeholder="superadmin@corefusiontech.com"
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
            {submitting ? 'Verifying...' : 'Verify & Access'}
          </button>

          <p className="text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
            <a href="/admin" className="font-semibold text-brand hover:underline">Back to Admin Panel</a>
          </p>
        </form>
      </div>
    </div>
  );
}
