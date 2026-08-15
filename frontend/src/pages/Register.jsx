import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';

// Public self-serve signup is Client-only by design — Employee and Admin accounts
// carry internal RBAC permissions and must be provisioned by an authenticated
// Admin/HR user via the "Add User" flow in the Admin Panel, not self-selected here.
// (Partner is a separate external account type, unaffected by that restriction.)
export default function Register() {
  useDocumentTitle('Register | CoreFusion Technologies');
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/login');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      // Supabase email-confirmation flow — not an error, show success notice
      if (msg.toLowerCase().includes('confirm your email') || msg.toLowerCase().includes('check your email')) {
        setSuccess(msg);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

  return (
    <div className="flex items-center justify-center bg-surface-container px-margin-mobile py-16 dark:bg-dark-surface-container">
      <div className="w-full max-w-md rounded-lg bg-white p-stack-lg shadow-card-hover dark:bg-dark-surface">
        <h1 className="mb-1 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Create an account</h1>
        <p className="mb-stack-md text-body-sm text-ink-muted dark:text-dark-ink-muted">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/')} className="font-semibold text-brand hover:underline">Sign in</button>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Full Name</span>
            <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Email</span>
            <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Password</span>
            <div className="relative">
              <input required type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className={inputClass} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>

          <div className="rounded-lg bg-surface-container p-stack-md dark:bg-dark-surface-container">
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
              Self-serve registration creates a Client account. Employee, Admin, and Partner accounts must be provisioned by your Admin/HR team.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Confirm Password</span>
            <input required type={showPassword ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" className={inputClass} />
          </label>

          {error && (
            <p className="flex items-center gap-1 text-body-sm text-status-error-text">
              <Icon name="error" className="text-base" />{error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-1 rounded bg-green-50 p-3 text-body-sm text-green-600">
              <Icon name="check_circle" className="text-base" />{success}
            </p>
          )}

          <button type="submit" disabled={submitting} className="h-11 rounded bg-brand font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark active:scale-95 disabled:opacity-60">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
            By registering you agree to our{' '}
            <Link to="/terms" className="text-brand hover:underline">Terms</Link>{' '}and{' '}
            <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
