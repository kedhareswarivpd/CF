import { useState, useEffect, useRef, cloneElement, Children } from 'react';
import { submitContactForm } from '../../api/contact.js';
import { ApiRequestError } from '../../api/client.js';
import Icon from '../ui/Icon.jsx';

const initialForm = { name: '', email: '', phone: '', company: '', department: 'general', subject: '', message: '' };

const DEPARTMENTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'hr', label: 'Careers / HR' },
];

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    const keys = Object.keys(fieldErrors);
    if (keys.length > 0) {
      const firstInput = formRef.current?.querySelector(`#field-${keys[0]}`);
      firstInput?.focus();
    }
  }, [fieldErrors]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setFieldErrors({});
    setErrorMessage('');

    try {
      await submitContactForm(form);
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiRequestError && err.errors?.length) {
        const byField = {};
        err.errors.forEach((fe) => {
          if (fe.field) byField[fe.field] = fe.message;
        });
        setFieldErrors(byField);
      }
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-accent-cyan-pale border border-brand/20 rounded-lg p-stack-lg text-center">
        <Icon name="check_circle" className="text-brand text-5xl mb-4" />
        <h3 className="font-display text-headline-sm text-brand-dark mb-2">Message sent</h3>
        <p className="text-ink-muted mb-6">
          Thank you for reaching out — our team will get back to you shortly.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-brand font-label-caps text-label-caps uppercase hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md" ref={formRef}>
      <div className="grid sm:grid-cols-2 gap-stack-md">
        <Field label="Full Name" error={fieldErrors.name} inputId="field-name" errorId="field-error-name">
          <input required value={form.name} onChange={update('name')} className={inputClass} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" error={fieldErrors.email} inputId="field-email" errorId="field-error-email">
          <input
            required
            type="email"
            value={form.email}
            onChange={update('email')}
            className={inputClass}
            placeholder="jane@company.com"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-stack-md">
        <Field label="Phone (optional)" error={fieldErrors.phone} inputId="field-phone" errorId="field-error-phone">
          <input value={form.phone} onChange={update('phone')} className={inputClass} placeholder="+1 555 000 0000" />
        </Field>
        <Field label="Company (optional)" error={fieldErrors.company} inputId="field-company" errorId="field-error-company">
          <input value={form.company} onChange={update('company')} className={inputClass} placeholder="Acme Corp" />
        </Field>
      </div>

      <Field label="Department" inputId="field-department">
        <select value={form.department} onChange={update('department')} className={inputClass}>
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Subject (optional)" error={fieldErrors.subject} inputId="field-subject" errorId="field-error-subject">
        <input value={form.subject} onChange={update('subject')} className={inputClass} placeholder="How can we help?" />
      </Field>

      <Field label="Message" error={fieldErrors.message} inputId="field-message" errorId="field-error-message">
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update('message')}
          className={inputClass}
          placeholder="Tell us about your project..."
        />
      </Field>

      {status === 'error' && !Object.keys(fieldErrors).length && (
        <p className="text-status-error-text text-body-sm">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-brand text-white h-12 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

const inputClass =
  'w-full rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors';

function Field({ label, error, children, inputId, errorId }) {
  const child = Children.only(children);
  const extraProps = {};
  if (inputId) extraProps.id = inputId;
  if (error && errorId) extraProps['aria-describedby'] = errorId;
  const enhancedChild = Object.keys(extraProps).length > 0 ? cloneElement(child, extraProps) : child;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-caps text-label-caps uppercase text-ink-muted">{label}</span>
      {enhancedChild}
      {error && errorId && <span id={errorId} className="text-status-error-text text-xs">{error}</span>}
    </label>
  );
}
