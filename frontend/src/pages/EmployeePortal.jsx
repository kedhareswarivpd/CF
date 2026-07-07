import { useState, useEffect } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { employeePortalTabs, demoEmployeeProfile, demoAttendance, demoLeaves, demoTimesheets, demoPayslips, demoTasks, demoEmployeeProjects, demoPerformance, demoTraining, demoDocuments } from '../data/portal.js';
import {
  fetchEmployeeProfile, fetchEmployeeAttendance, fetchEmployeeLeaves,
  fetchEmployeeTimesheets, fetchEmployeePayslips,
  checkInEmployee, checkOutEmployee, applyLeave, logTimesheet,
} from '../lib/db.js';

function LoginGate({ onSuccess }) {
  const { login } = useAuth();
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
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant px-4 py-2.5 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-lg shadow-card-hover p-stack-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center">
            <Icon name="badge" className="text-white text-xl" />
          </div>
          <div>
            <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Employee Portal</h1>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Sign in to access your portal</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@corefusiontech.com" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Password</span>
            <div className="relative">
              <input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>
          {error && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
          <button type="submit" disabled={submitting} className="bg-brand text-white h-11 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-60">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Overview({ profile, attendance, leaves, timesheets, payslips }) {
  const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[
          { label: 'Today', value: attendance.status, icon: 'clock_loader_60', sub: `${attendance.checkIn || '--'} - ${attendance.checkOut || '--'}` },
          { label: 'Hours This Week', value: `${totalHours}h`, icon: 'schedule' },
          { label: 'Pending Leaves', value: pendingLeaves, icon: 'beach_access' },
          { label: 'Latest Payslip', value: `$${payslips[0]?.netPay?.toLocaleString() || 0}`, icon: 'payments' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <div className="flex items-center gap-3 mb-2">
              <Icon name={stat.icon} className="text-brand text-2xl" />
              <span className="font-label-caps text-label-caps text-ink-muted">{stat.label}</span>
            </div>
            <p className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand capitalize">{stat.value}</p>
            {stat.sub && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">My Profile</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Name', value: profile.name },
            { label: 'Employee Code', value: profile.employee_code },
            { label: 'Designation', value: profile.designation },
            { label: 'Department', value: profile.department },
            { label: 'Email', value: profile.email },
            { label: 'Status', value: profile.status },
          ].map((f) => (
            <div key={f.label}>
              <span className="font-label-caps text-label-caps text-ink-muted">{f.label}</span>
              <p className="text-body-md text-brand-dark dark:text-dark-brand capitalize">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Attendance({ attendance, employeeId }) {
  const [checkedIn, setCheckedIn] = useState(Boolean(attendance.checkIn));
  const [checkedOut, setCheckedOut] = useState(Boolean(attendance.checkOut));
  const [current, setCurrent] = useState(attendance);

  const handleCheckIn = async () => {
    try {
      const updated = employeeId ? await checkInEmployee(employeeId) : null;
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setCurrent((prev) => ({ ...prev, checkIn: updated?.checkIn || now, status: 'present' }));
      setCheckedIn(true);
    } catch { setCheckedIn(true); }
  };

  const handleCheckOut = async () => {
    try {
      const updated = employeeId ? await checkOutEmployee(employeeId) : null;
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setCurrent((prev) => ({ ...prev, checkOut: updated?.checkOut || now }));
      setCheckedOut(true);
    } catch { setCheckedOut(true); }
  };

  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-6">Today's Attendance</h3>
        <div className="grid sm:grid-cols-3 gap-gutter mb-6">
          <div className="text-center p-stack-lg bg-surface-container dark:bg-dark-surface-container rounded-lg">
            <Icon name="login" className="text-brand text-3xl mb-2" />
            <p className="font-label-caps text-label-caps text-ink-muted">Check-In</p>
            <p className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{current.checkIn || '--'}</p>
          </div>
          <div className="text-center p-stack-lg bg-surface-container dark:bg-dark-surface-container rounded-lg">
            <Icon name="logout" className="text-brand text-3xl mb-2" />
            <p className="font-label-caps text-label-caps text-ink-muted">Check-Out</p>
            <p className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{current.checkOut || '--'}</p>
          </div>
          <div className="text-center p-stack-lg bg-surface-container dark:bg-dark-surface-container rounded-lg">
            <Icon name="badge" className="text-brand text-3xl mb-2" />
            <p className="font-label-caps text-label-caps text-ink-muted">Status</p>
            <StatusBadge variant={current.status === 'present' ? 'success' : 'warning'} className="mt-1">
              {current.status || 'Not checked in'}
            </StatusBadge>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleCheckIn} variant={checkedIn ? 'outline' : 'primary'} size="md" disabled={checkedIn} icon={<Icon name="login" />}>
            {checkedIn ? 'Checked In' : 'Check In'}
          </Button>
          <Button onClick={handleCheckOut} variant={checkedOut ? 'outline' : 'primary'} size="md" disabled={checkedOut || !checkedIn} icon={<Icon name="logout" />}>
            {checkedOut ? 'Checked Out' : 'Check Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Leaves({ leaves: initialLeaves, employeeId }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Annual', from: '', to: '', reason: '' });
  const [allLeaves, setAllLeaves] = useState(initialLeaves);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to) return;
    setSubmitting(true);
    try {
      let newLeave;
      if (employeeId) {
        newLeave = await applyLeave(employeeId, form.type, form.from, form.to, form.reason);
      } else {
        const days = Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1;
        newLeave = { id: `LV-${Date.now()}`, type: form.type, from: form.from, to: form.to, status: 'pending', days };
      }
      setAllLeaves((prev) => [newLeave, ...prev]);
      setForm({ type: 'Annual', from: '', to: '', reason: '' });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="md" icon={<Icon name="add" />}>Apply Leave</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand">
              <option>Annual</option><option>Sick</option><option>Personal</option>
            </select>
            <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
            <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
          </div>
          <textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={2} className="w-full border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
            <tr><th className="px-stack-lg py-4">Type</th><th className="px-stack-lg py-4">From</th><th className="px-stack-lg py-4">To</th><th className="px-stack-lg py-4">Days</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {allLeaves.map((l) => (
              <tr key={l.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand capitalize">{l.type}</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{l.from}</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{l.to}</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{l.days}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={l.status === 'approved' ? 'success' : l.status === 'pending' ? 'warning' : 'error'}>{l.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Timesheets({ timesheets: initialTimesheets, employeeId }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', project: '', hours: '', description: '' });
  const [allEntries, setAllEntries] = useState(initialTimesheets);
  const [submitting, setSubmitting] = useState(false);
  const totalHours = allEntries.reduce((s, e) => s + e.hours, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.hours) return;
    setSubmitting(true);
    try {
      let entry;
      if (employeeId) {
        entry = await logTimesheet(employeeId, form.date, form.project, parseFloat(form.hours), form.description);
      } else {
        entry = { id: `TS-${Date.now()}`, date: form.date, project: form.project || 'General', hours: parseFloat(form.hours), description: form.description };
      }
      setAllEntries((prev) => [entry, ...prev]);
      setForm({ date: '', project: '', hours: '', description: '' });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-stack-md">
      <div className="flex items-center justify-between">
        <p className="text-body-md text-ink-muted">Total hours logged: <span className="font-semibold text-brand-dark dark:text-dark-brand">{totalHours}h</span></p>
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="md" icon={<Icon name="add" />}>Log Hours</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
            <input type="text" placeholder="Project name" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}
              className="border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
            <input type="number" step="0.5" placeholder="Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })}
              className="border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2} className="w-full border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Logging...' : 'Log'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
            <tr><th className="px-stack-lg py-4">Date</th><th className="px-stack-lg py-4">Project</th><th className="px-stack-lg py-4">Hours</th><th className="px-stack-lg py-4">Description</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {allEntries.map((e) => (
              <tr key={e.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{e.date}</td>
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{e.project}</td>
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{e.hours}h</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Payslips({ payslips }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Period</th><th className="px-stack-lg py-4">Gross</th><th className="px-stack-lg py-4">Deductions</th><th className="px-stack-lg py-4">Net Pay</th><th className="px-stack-lg py-4">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {payslips.map((p) => (
            <tr key={`${p.month}-${p.year}`} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{p.month} {p.year}</td>
              <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">${p.grossPay.toLocaleString()}</td>
              <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">${p.deductions.toLocaleString()}</td>
              <td className="px-stack-lg py-4 font-semibold text-body-md text-brand-dark dark:text-dark-brand">${p.netPay.toLocaleString()}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant="success">{p.status}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tasks({ tasks }) {
  const priorityColor = { urgent: 'error', high: 'warning', medium: 'info', low: 'neutral' };
  const statusColor = { done: 'success', in_progress: 'info', todo: 'neutral', blocked: 'error' };
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Task</th><th className="px-stack-lg py-4">Project</th><th className="px-stack-lg py-4">Priority</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Due</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{t.title}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.project}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={priorityColor[t.priority]}>{t.priority}</StatusBadge></td>
              <td className="px-stack-lg py-4"><StatusBadge variant={statusColor[t.status]}>{t.status.replace('_', ' ')}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Projects({ projects }) {
  const statusColor = { completed: 'success', in_progress: 'info', on_hold: 'warning', planning: 'neutral' };
  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <div key={p.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{p.title}</h3>
              <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Role: {p.role} &middot; Deadline: {p.deadline}</p>
            </div>
            <StatusBadge variant={statusColor[p.status]}>{p.status.replace('_', ' ')}</StatusBadge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-surface-container dark:bg-dark-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${p.progress}%` }} />
            </div>
            <span className="text-body-sm font-semibold text-brand-dark dark:text-dark-brand w-10 text-right">{p.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Performance({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.period} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{r.period}</h3>
            <div className="flex items-center gap-2">
              <Icon name="star" className="text-yellow-400 text-xl" />
              <span className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{r.rating}</span>
              <span className="text-body-sm text-ink-muted">/5</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-surface-container dark:bg-dark-surface-container rounded-lg p-4 text-center">
              <p className="font-label-caps text-label-caps text-ink-muted mb-1">Goals Set</p>
              <p className="font-stat text-2xl text-brand-dark dark:text-dark-brand">{r.goals}</p>
            </div>
            <div className="bg-surface-container dark:bg-dark-surface-container rounded-lg p-4 text-center">
              <p className="font-label-caps text-label-caps text-ink-muted mb-1">Goals Achieved</p>
              <p className="font-stat text-2xl text-brand-dark dark:text-dark-brand">{r.achieved}</p>
            </div>
          </div>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted italic">"{r.feedback}"</p>
        </div>
      ))}
    </div>
  );
}

function Training({ courses }) {
  const statusColor = { completed: 'success', in_progress: 'info', pending: 'neutral' };
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Course</th><th className="px-stack-lg py-4">Category</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Completed On</th><th className="px-stack-lg py-4">Score</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {courses.map((c) => (
            <tr key={c.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{c.title}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.category}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={statusColor[c.status]}>{c.status.replace('_', ' ')}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.completedOn || '—'}</td>
              <td className="px-stack-lg py-4 text-body-sm font-semibold text-brand-dark dark:text-dark-brand">{c.score || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Documents({ docs }) {
  const typeIcon = { contract: 'gavel', id_proof: 'badge', certificate: 'workspace_premium', other: 'description', resume: 'person' };
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {docs.map((d) => (
        <div key={d.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-accent-cyan-pale flex items-center justify-center shrink-0">
            <Icon name={typeIcon[d.type] || 'description'} className="text-brand text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-body-md font-semibold text-brand-dark dark:text-dark-brand truncate">{d.name}</p>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted capitalize">{d.type.replace('_', ' ')} &middot; {d.size}</p>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{d.uploadedOn}</p>
          </div>
          <button className="text-brand hover:text-brand-dark transition-colors shrink-0" aria-label="Download">
            <Icon name="download" className="text-xl" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function EmployeePortal() {
  useDocumentTitle('Employee Portal | CoreFusion Technologies');
  const { user, initializing } = useAuth();
  const [empAuthed, setEmpAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(demoEmployeeProfile);
  const [employeeId, setEmployeeId] = useState(null);
  const [attendance, setAttendance] = useState(demoAttendance);
  const [leaves, setLeaves] = useState(demoLeaves);
  const [timesheets, setTimesheets] = useState(demoTimesheets);
  const [payslips, setPayslips] = useState(demoPayslips);
  const [tasks] = useState(demoTasks);
  const [projects] = useState(demoEmployeeProjects);
  const [performance] = useState(demoPerformance);
  const [training] = useState(demoTraining);
  const [documents] = useState(demoDocuments);

  useEffect(() => {
    if (!empAuthed || !user) { setLoading(false); return; }
    setLoading(true);
    fetchEmployeeProfile(user.id)
      .then((p) => {
        setProfile(p);
        setEmployeeId(p._employeeId);
        return Promise.allSettled([
          fetchEmployeeAttendance(p._employeeId),
          fetchEmployeeLeaves(p._employeeId),
          fetchEmployeeTimesheets(p._employeeId),
          fetchEmployeePayslips(p._employeeId),
        ]);
      })
      .then(([att, lv, ts, ps]) => {
        if (att.status === 'fulfilled') setAttendance(att.value);
        if (lv.status === 'fulfilled') setLeaves(lv.value);
        if (ts.status === 'fulfilled') setTimesheets(ts.value);
        if (ps.status === 'fulfilled') setPayslips(ps.value);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empAuthed, user]);

  if (initializing) return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;
  if (!empAuthed) return <LoginGate onSuccess={() => setEmpAuthed(true)} />;
  if (loading) return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">Employee Portal</h1>
              <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{profile.designation} &middot; {profile.department}</p>
            </div>
          </div>
          <button onClick={() => setEmpAuthed(false)} className="border border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-brand hover:text-brand transition-all">
            Sign Out
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-stack-lg border-b border-outline-variant dark:border-dark-outline-variant overflow-x-auto">
          {employeePortalTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-brand dark:text-dark-brand border-brand dark:border-dark-brand' : 'text-ink-muted dark:text-dark-ink-muted border-transparent hover:text-brand dark:hover:text-dark-brand'
              }`}>
              <Icon name={tab.icon} className="text-lg" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <Overview profile={profile} attendance={attendance} leaves={leaves} timesheets={timesheets} payslips={payslips} />}
        {activeTab === 'attendance' && <Attendance attendance={attendance} employeeId={employeeId} />}
        {activeTab === 'leaves' && <Leaves leaves={leaves} employeeId={employeeId} />}
        {activeTab === 'timesheets' && <Timesheets timesheets={timesheets} employeeId={employeeId} />}
        {activeTab === 'payslips' && <Payslips payslips={payslips} />}
        {activeTab === 'tasks' && <Tasks tasks={tasks} />}
        {activeTab === 'projects' && <Projects projects={projects} />}
        {activeTab === 'performance' && <Performance reviews={performance} />}
        {activeTab === 'training' && <Training courses={training} />}
        {activeTab === 'documents' && <Documents docs={documents} />}
      </div>
    </div>
  );
}
