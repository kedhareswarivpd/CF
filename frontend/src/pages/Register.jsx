import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/ui/Icon.jsx';

export default function Register() {
  useDocumentTitle('Register | CoreFusion Technologies');
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
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
      navigate('/client');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

  return (
    <div className="bg-surface-container dark:bg-dark-surface-container flex items-center justify-center px-margin-mobile py-16">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-lg shadow-card-hover p-stack-lg">
        <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-1">Create an account</h1>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mb-stack-md">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/')} className="text-brand hover:underline font-semibold">Sign in</button>
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

          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Confirm Password</span>
            <input required type={showPassword ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" className={inputClass} />
          </label>

          {error && (
            <p className="text-status-error-text text-body-sm flex items-center gap-1">
              <Icon name="error" className="text-base" />{error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="bg-brand text-white h-11 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-60">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted text-center">
            By registering you agree to our{' '}
            <Link to="/terms" className="text-brand hover:underline">Terms</Link>{' '}and{' '}
            <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
