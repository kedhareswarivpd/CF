import { useState, useEffect } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { employeeTabsForRole, demoEmployeeProfile, demoAttendance, demoLeaves, demoTimesheets, demoPayslips, demoTasks, demoEmployeeProjects, demoPerformance, demoTraining, demoDocuments, demoLeads, demoProposals, demoContracts } from '../data/portal.js';
import {
  fetchEmployeeProfile, fetchEmployeeAttendance, fetchEmployeeLeaves,
  fetchEmployeeTimesheets, fetchEmployeePayslips,
  checkInEmployee, checkOutEmployee,
} from '../lib/db.js';
import { applyLeave as applyLeaveApi, submitTimesheet } from '../api/employees.js';
import {
  fetchLeads, createLead, updateLead,
  fetchProposals, createProposal, sendProposal, acceptProposal, rejectProposal,
  fetchContracts, createContract, signContract,
} from '../api/crm.js';
import {
  fetchLeaves, reviewLeave, fetchAllTimesheets, reviewTimesheet,
  fetchApplications, updateApplicationStatus,
  fetchTickets, updateTicket, replyToTicket,
  fetchInvoices, createInvoice, updateInvoice, recordPayment,
  fetchTestimonials, updateTestimonial,
  fetchTasks, createTask, updateTaskStatus,
  assignProjectTeam, fetchAdminProjects, createProject,
  fetchClients, fetchEmployees,
} from '../api/admin.js';
import { loginToPortal } from '../lib/portalAuth.js';

const EMPLOYEE_PORTAL_ROLES = ['employee', 'developer', 'sales', 'marketing', 'project_manager', 'qa', 'support', 'finance', 'hr'];

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
      await loginToPortal(login, email, password, EMPLOYEE_PORTAL_ROLES);
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
  const today = new Date().toISOString().slice(0, 10);
  const isToday = attendance.date === today;
  const [checkedIn, setCheckedIn] = useState(isToday && Boolean(attendance.checkIn));
  const [checkedOut, setCheckedOut] = useState(isToday && Boolean(attendance.checkOut));
  const [current, setCurrent] = useState(
    isToday ? attendance : { date: today, checkIn: null, checkOut: null, status: 'absent' }
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCheckIn = async () => {
    setLoading(true);
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    try {
      const updated = employeeId ? await checkInEmployee(employeeId) : null;
      const time = updated?.checkIn || now;
      setCurrent((prev) => ({ ...prev, checkIn: time, status: 'present' }));
      setCheckedIn(true);
      showToast(`Checked in at ${time}`);
    } catch {
      setCurrent((prev) => ({ ...prev, checkIn: now, status: 'present' }));
      setCheckedIn(true);
      showToast(`Checked in at ${now}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    try {
      const updated = employeeId ? await checkOutEmployee(employeeId) : null;
      const time = updated?.checkOut || now;
      setCurrent((prev) => ({ ...prev, checkOut: time }));
      setCheckedOut(true);
      showToast(`Checked out at ${time}`);
    } catch {
      setCurrent((prev) => ({ ...prev, checkOut: now }));
      setCheckedOut(true);
      showToast(`Checked out at ${now}`);
    } finally {
      setLoading(false);
    }
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
          <Button onClick={handleCheckIn} variant={checkedIn ? 'outline' : 'primary'} size="md" disabled={checkedIn || loading} icon={<Icon name="login" />}>
            {loading && !checkedIn ? 'Checking in...' : checkedIn ? 'Checked In ✓' : 'Check In'}
          </Button>
          <Button onClick={handleCheckOut} variant={checkedOut ? 'outline' : 'primary'} size="md" disabled={checkedOut || !checkedIn || loading} icon={<Icon name="logout" />}>
            {loading && checkedIn && !checkedOut ? 'Checking out...' : checkedOut ? 'Checked Out ✓' : 'Check Out'}
          </Button>
        </div>
        {toast && (
          <p className="mt-4 text-center text-body-sm text-green-600 bg-green-50 border border-green-200 rounded-lg py-2 px-4">
            ✓ {toast}
          </p>
        )}
      </div>
    </div>
  );
}

function Leaves({ leaves: initialLeaves, employeeId, accessToken }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Annual', from: '', to: '', reason: '' });
  const [allLeaves, setAllLeaves] = useState(initialLeaves);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to) return;
    setSubmitting(true);
    try {
      let newLeave;
      if (accessToken) {
        const res = await applyLeaveApi(accessToken, {
          type: form.type.toLowerCase(),
          start_date: form.from,
          end_date: form.to,
          reason: form.reason,
        });
        const d = res?.data;
        const days = Math.ceil((new Date(d.end_date) - new Date(d.start_date)) / 86400000) + 1;
        newLeave = { id: d.id, type: d.type, from: d.start_date, to: d.end_date, status: d.status, days };
      } else {
        const days = Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1;
        newLeave = { id: `LV-${Date.now()}`, type: form.type, from: form.from, to: form.to, status: 'pending', days };
      }
      setAllLeaves((prev) => [newLeave, ...prev]);
      setForm({ type: 'Annual', from: '', to: '', reason: '' });
      setShowForm(false);
      showToast('Leave request submitted successfully.');
    } catch (err) {
      showToast(err?.message || 'Failed to submit leave request.');
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
      {toast && (
        <p className={`text-body-sm rounded-lg py-2 px-4 ${
          toast.includes('success') ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'
        }`}>{toast}</p>
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

function Timesheets({ timesheets: initialTimesheets, employeeId, accessToken }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', project: '', hours: '', description: '' });
  const [allEntries, setAllEntries] = useState(initialTimesheets);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const totalHours = allEntries.reduce((s, e) => s + e.hours, 0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.hours) return;
    setSubmitting(true);
    try {
      let entry;
      if (accessToken) {
        const res = await submitTimesheet(accessToken, {
          date: form.date,
          hours: parseFloat(form.hours),
          description: form.description || null,
        });
        const d = res?.data;
        entry = { id: d.id, date: d.date, project: form.project || 'General', hours: Number(d.hours), description: d.description };
      } else {
        entry = { id: `TS-${Date.now()}`, date: form.date, project: form.project || 'General', hours: parseFloat(form.hours), description: form.description };
      }
      setAllEntries((prev) => [entry, ...prev]);
      setForm({ date: '', project: '', hours: '', description: '' });
      setShowForm(false);
      showToast('Hours logged successfully.');
    } catch (err) {
      showToast(err?.message || 'Failed to log hours.');
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
      {toast && (
        <p className={`text-body-sm rounded-lg py-2 px-4 ${
          toast.includes('success') ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'
        }`}>{toast}</p>
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
          <button
            onClick={() => d.file_url ? window.open(d.file_url, '_blank') : null}
            disabled={!d.file_url}
            className={`shrink-0 transition-colors ${d.file_url ? 'text-brand hover:text-brand-dark cursor-pointer' : 'text-ink-muted/30 cursor-not-allowed'}`}
            aria-label="Download">
            <Icon name="download" className="text-xl" />
          </button>
        </div>
      ))}
    </div>
  );
}

function RowAction({ onClick, disabled, variant = 'primary', children }) {
  const styles = variant === 'primary'
    ? 'border-brand text-brand hover:bg-brand hover:text-white'
    : 'border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted hover:border-brand hover:text-brand';
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`text-label-caps uppercase font-label-caps px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${styles}`}>
      {children}
    </button>
  );
}

const EMPLOYEE_ROLES = ['developer', 'sales', 'marketing', 'project_manager', 'qa', 'support', 'finance', 'hr'];
const LEAD_STATUS_OPTIONS = ['new', 'contacted', 'requirement_gathering', 'proposal_sent', 'proposal_approved', 'converted', 'disqualified'];
const LEAD_SOURCE_OPTIONS = ['website', 'contact_form', 'referral', 'campaign', 'cold_outreach', 'event', 'other'];
const LEAD_STATUS_COLOR = { new: 'neutral', contacted: 'info', requirement_gathering: 'info', proposal_sent: 'warning', proposal_approved: 'success', converted: 'success', disqualified: 'error' };
const PROPOSAL_STATUS_COLOR = { draft: 'neutral', sent: 'warning', viewed: 'info', accepted: 'success', rejected: 'error' };
const CONTRACT_STATUS_COLOR = { pending: 'warning', signed: 'success', void: 'error' };

function Leads({ leads, accessToken, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', phone: '', source: 'website', estimated_value: '' });
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.email) return;
    setSubmitting(true);
    try {
      await createLead(accessToken, { ...form, estimated_value: form.estimated_value ? Number(form.estimated_value) : null });
      setForm({ company: '', contact_name: '', email: '', phone: '', source: 'website', estimated_value: '' });
      setShowForm(false);
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId, status) => {
    setSavingId(leadId);
    try {
      await updateLead(accessToken, leadId, { status });
      onRefresh();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="md" icon={<Icon name="add" />}>New Lead</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} />
            <input required type="text" placeholder="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className={inputClass} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass}>
              {LEAD_SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <input type="number" min="0" placeholder="Estimated value ($)" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Lead'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
            <tr><th className="px-stack-lg py-4">Company / Contact</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Source</th><th className="px-stack-lg py-4">Est. Value</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4">
                  <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{l.company || '—'}</p>
                  <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.contact_name}</p>
                </td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.email}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted capitalize">{l.source?.replace('_', ' ')}</td>
                <td className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-dark-brand">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : '—'}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={LEAD_STATUS_COLOR[l.status]}>{l.status?.replace('_', ' ')}</StatusBadge>
                    <select value={l.status} disabled={savingId === l.id || !accessToken} onChange={(e) => handleStatusChange(l.id, e.target.value)}
                      className="text-body-sm rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-2 py-1 disabled:opacity-50">
                      {LEAD_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Proposals({ proposals, leads, accessToken, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lead_id: '', scope_summary: '', price: '', currency: 'USD' });
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const leadLabel = (leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    return lead ? (lead.company || lead.contact_name) : 'Unknown lead';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lead_id || !form.scope_summary || !form.price) return;
    setSubmitting(true);
    try {
      await createProposal(accessToken, { ...form, price: Number(form.price) });
      setForm({ lead_id: '', scope_summary: '', price: '', currency: 'USD' });
      setShowForm(false);
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (action, proposalId) => {
    setActingId(proposalId);
    try {
      await action(accessToken, proposalId);
      onRefresh();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="md" icon={<Icon name="add" />}>New Proposal</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <select required value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} className={inputClass}>
              <option value="" disabled>Select lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.company || l.contact_name}</option>)}
            </select>
            <input required type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputClass}>
              {['USD', 'EUR', 'GBP', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea required placeholder="Scope summary" value={form.scope_summary} onChange={(e) => setForm({ ...form, scope_summary: e.target.value })} rows={3} className={`w-full ${inputClass}`} />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Draft'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
            <tr><th className="px-stack-lg py-4">Lead</th><th className="px-stack-lg py-4">Price</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Sent</th><th className="px-stack-lg py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {proposals.map((p) => (
              <tr key={p.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{leadLabel(p.lead_id)}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.currency} {Number(p.price).toLocaleString()}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={PROPOSAL_STATUS_COLOR[p.status]}>{p.status}</StatusBadge></td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.sent_at ? p.sent_at.slice(0, 10) : '—'}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    {p.status === 'draft' && <RowAction disabled={actingId === p.id} onClick={() => runAction(sendProposal, p.id)}>Send</RowAction>}
                    {(p.status === 'sent' || p.status === 'viewed') && (
                      <>
                        <RowAction disabled={actingId === p.id} onClick={() => runAction(acceptProposal, p.id)}>Accept</RowAction>
                        <RowAction variant="outline" disabled={actingId === p.id} onClick={() => runAction(rejectProposal, p.id)}>Reject</RowAction>
                      </>
                    )}
                    {p.status === 'accepted' && <RowAction disabled={actingId === p.id} onClick={() => runAction(createContract, p.id)}>Generate Contract</RowAction>}
                  </div>
                </td>
              </tr>
            ))}
            {!proposals.length && (
              <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No proposals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Contracts({ contracts, proposals, leads, accessToken, onRefresh }) {
  const [actingId, setActingId] = useState(null);

  const describe = (proposalId) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return 'Unknown deal';
    const lead = leads.find((l) => l.id === proposal.lead_id);
    return `${lead ? (lead.company || lead.contact_name) : 'Unknown lead'} — ${proposal.currency} ${Number(proposal.price).toLocaleString()}`;
  };

  const handleSign = async (contractId) => {
    setActingId(contractId);
    try {
      await signContract(accessToken, contractId, { client_signed: true, company_signed: true, provision_client_account: true });
      onRefresh();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Deal</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Client Signed</th><th className="px-stack-lg py-4">Company Signed</th><th className="px-stack-lg py-4">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {contracts.map((c) => (
            <tr key={c.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{describe(c.proposal_id)}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={CONTRACT_STATUS_COLOR[c.status]}>{c.status}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.signed_by_client_at ? c.signed_by_client_at.slice(0, 10) : '—'}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.signed_by_company_at ? c.signed_by_company_at.slice(0, 10) : '—'}</td>
              <td className="px-stack-lg py-4">
                {c.status === 'pending' && <RowAction disabled={actingId === c.id} onClick={() => handleSign(c.id)}>Mark Signed</RowAction>}
              </td>
            </tr>
          ))}
          {!contracts.length && (
            <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No contracts yet — generate one from an accepted proposal.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const PROJECT_STATUS_COLOR = { planning: 'neutral', in_progress: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error' };
const TASK_STATUS_COLUMNS = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];
const TASK_PRIORITY_COLOR = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'error' };
const TICKET_STATUS_COLOR = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'neutral' };
const TICKET_PRIORITY_COLOR = { low: 'neutral', medium: 'info', high: 'warning', critical: 'error' };
const INVOICE_STATUS_COLOR = { draft: 'neutral', sent: 'warning', paid: 'success', overdue: 'error', cancelled: 'neutral' };
const TIMESHEET_STATUS_COLOR = { draft: 'neutral', submitted: 'warning', approved: 'success', rejected: 'error' };
const APPLICATION_STATUS_OPTIONS = ['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'];
const APPLICATION_STATUS_COLOR = { applied: 'neutral', shortlisted: 'info', interview: 'warning', offered: 'success', rejected: 'error', hired: 'success' };
const FORM_INPUT_CLASS = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

// ---------- Marketing ----------
function MarketingLeadsView({ accessToken }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchLeads(accessToken).then((r) => setLeads(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Company / Contact</th><th className="px-stack-lg py-4">Source</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Est. Value</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {leads.map((l) => (
            <tr key={l.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4">
                <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{l.company || '—'}</p>
                <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.contact_name}</p>
              </td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted capitalize">{l.source?.replace('_', ' ')}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={LEAD_STATUS_COLOR[l.status]}>{l.status?.replace('_', ' ')}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-dark-brand">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : '—'}</td>
            </tr>
          ))}
          {!leads.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No leads yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TestimonialModeration({ accessToken }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchTestimonials(accessToken, { is_published: 'false' }).then((r) => setItems(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const approve = async (id) => {
    setActingId(id);
    try { await updateTestimonial(accessToken, id, { is_published: true }); load(); } finally { setActingId(null); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-4">
      {items.map((t) => (
        <div key={t.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-display text-body-md font-semibold text-brand-dark dark:text-dark-brand">{t.author_name}</p>
              <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.author_title}{t.company_name ? ` · ${t.company_name}` : ''}</p>
            </div>
            <RowAction disabled={actingId === t.id} onClick={() => approve(t.id)}>Approve &amp; Publish</RowAction>
          </div>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted italic">&ldquo;{t.content}&rdquo;</p>
        </div>
      ))}
      {!items.length && <p className="text-body-sm text-ink-muted text-center py-8">No testimonials awaiting moderation.</p>}
    </div>
  );
}

// ---------- Project Manager ----------
function TeamProjects({ accessToken, userId }) {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', client_id: '', budget: '', start_date: '', end_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [teamSelection, setTeamSelection] = useState([]);

  const load = () => {
    if (!accessToken || !userId) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      fetchAdminProjects(accessToken, { project_manager_id: userId }),
      fetchEmployees(accessToken, { limit: 100 }),
      fetchClients(accessToken, { limit: 100 }),
    ]).then(([p, e, c]) => {
      if (p.status === 'fulfilled') setProjects(p.value?.data || []);
      if (e.status === 'fulfilled') setEmployees(e.value?.data || []);
      if (c.status === 'fulfilled') setClients(c.value?.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken, userId]);

  const clientName = (id) => clients.find((c) => c.id === id)?.company_name || '—';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    try {
      await createProject(accessToken, {
        title: form.title,
        client_id: form.client_id || null,
        budget: form.budget ? Number(form.budget) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        project_manager_id: userId,
      });
      setForm({ title: '', client_id: '', budget: '', start_date: '', end_date: '' });
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const startAssign = (project) => { setAssigningId(project.id); setTeamSelection([]); };
  const toggleTeamMember = (id) => setTeamSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const submitAssign = async () => { await assignProjectTeam(accessToken, assigningId, teamSelection); setAssigningId(null); load(); };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>New Project</Button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input required type="text" placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={FORM_INPUT_CLASS} />
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={FORM_INPUT_CLASS}>
              <option value="">No client yet</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.id}</option>)}
            </select>
            <input type="number" min="0" placeholder="Budget ($)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={FORM_INPUT_CLASS} />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={FORM_INPUT_CLASS} />
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={FORM_INPUT_CLASS} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{p.title}</h3>
                <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Client: {clientName(p.client_id)}{p.budget ? ` · Budget: $${Number(p.budget).toLocaleString()}` : ''}</p>
              </div>
              <StatusBadge variant={PROJECT_STATUS_COLOR[p.status]}>{p.status?.replace('_', ' ')}</StatusBadge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-surface-container dark:bg-dark-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${p.progress_percent}%` }} />
              </div>
              <span className="text-body-sm font-semibold text-brand-dark dark:text-dark-brand w-10 text-right">{p.progress_percent}%</span>
            </div>
            {assigningId === p.id ? (
              <div className="border-t border-outline-variant dark:border-dark-outline-variant pt-3 space-y-2">
                <p className="font-label-caps text-label-caps uppercase text-ink-muted">Select team members</p>
                <div className="flex flex-wrap gap-2">
                  {employees.map((emp) => (
                    <button key={emp.id} type="button" onClick={() => toggleTeamMember(emp.id)}
                      className={`text-body-sm px-3 py-1.5 rounded border transition-colors ${teamSelection.includes(emp.id) ? 'bg-brand text-white border-brand' : 'border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted hover:border-brand'}`}>
                      {emp.employee_code}{emp.designation ? ` · ${emp.designation}` : ''}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <RowAction onClick={submitAssign}>Save Team</RowAction>
                  <RowAction variant="outline" onClick={() => setAssigningId(null)}>Cancel</RowAction>
                </div>
              </div>
            ) : (
              <RowAction onClick={() => startAssign(p)}>Assign Team</RowAction>
            )}
          </div>
        ))}
        {!projects.length && <p className="text-body-sm text-ink-muted text-center py-8">No projects assigned to you yet.</p>}
      </div>
    </div>
  );
}

function TaskBoard({ accessToken, userId }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!accessToken || !userId) { setLoading(false); return; }
    fetchAdminProjects(accessToken, { project_manager_id: userId }).then((r) => {
      const items = r?.data || [];
      setProjects(items);
      setSelectedProject((prev) => prev || items[0]?.id || '');
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, userId]);

  const loadTasks = () => {
    if (!accessToken || !selectedProject) { setLoading(false); return; }
    setLoading(true);
    fetchTasks(accessToken, { project_id: selectedProject, limit: 100 }).then((r) => setTasks(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadTasks(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken, selectedProject]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !selectedProject) return;
    setSubmitting(true);
    try {
      await createTask(accessToken, { project_id: selectedProject, title: form.title, priority: form.priority, due_date: form.due_date || null });
      setForm({ title: '', priority: 'medium', due_date: '' });
      setShowForm(false);
      loadTasks();
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (taskId, status) => {
    setSavingId(taskId);
    try { await updateTaskStatus(accessToken, taskId, status); loadTasks(); } finally { setSavingId(null); }
  };

  return (
    <div className="space-y-stack-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className={FORM_INPUT_CLASS}>
          {!projects.length && <option value="">No projects</option>}
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <Button variant="primary" size="md" icon={<Icon name="add" />} disabled={!selectedProject} onClick={() => setShowForm((v) => !v)}>New Task</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <input required type="text" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={FORM_INPUT_CLASS} />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={FORM_INPUT_CLASS}>
              {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={FORM_INPUT_CLASS} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Add Task'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-5 gap-gutter">
          {TASK_STATUS_COLUMNS.map((col) => (
            <div key={col} className="bg-surface-container dark:bg-dark-surface-container rounded-lg p-3 space-y-2">
              <p className="font-label-caps text-label-caps uppercase text-ink-muted">{col.replace('_', ' ')} ({tasks.filter((t) => t.status === col).length})</p>
              {tasks.filter((t) => t.status === col).map((t) => (
                <div key={t.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded p-3 space-y-2">
                  <p className="text-body-sm font-semibold text-brand-dark dark:text-dark-brand">{t.title}</p>
                  <StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
                  <select value={t.status} disabled={savingId === t.id} onChange={(e) => changeStatus(t.id, e.target.value)}
                    className="w-full text-body-sm rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-2 py-1">
                    {TASK_STATUS_COLUMNS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Approvals({ accessToken }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAllTimesheets(accessToken, { status: 'submitted', limit: 100 }).then((r) => setTimesheets(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const review = async (id, status) => {
    setActingId(id);
    try { await reviewTimesheet(accessToken, id, status); load(); } finally { setActingId(null); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Date</th><th className="px-stack-lg py-4">Hours</th><th className="px-stack-lg py-4">Description</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {timesheets.map((t) => (
            <tr key={t.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.date}</td>
              <td className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-dark-brand">{t.hours}h</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.description || '—'}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={TIMESHEET_STATUS_COLOR[t.status]}>{t.status}</StatusBadge></td>
              <td className="px-stack-lg py-4">
                <div className="flex gap-2">
                  <RowAction disabled={actingId === t.id} onClick={() => review(t.id, 'approved')}>Approve</RowAction>
                  <RowAction variant="outline" disabled={actingId === t.id} onClick={() => review(t.id, 'rejected')}>Reject</RowAction>
                </div>
              </td>
            </tr>
          ))}
          {!timesheets.length && <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No timesheets awaiting approval.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ---------- QA ----------
function TestQueue({ accessToken }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchTasks(accessToken, { status: 'in_review', limit: 100 }).then((r) => setTasks(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const resolve = async (id, status) => {
    setSavingId(id);
    try { await updateTaskStatus(accessToken, id, status); load(); } finally { setSavingId(null); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Task</th><th className="px-stack-lg py-4">Priority</th><th className="px-stack-lg py-4">Due</th><th className="px-stack-lg py-4">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{t.title}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.due_date || '—'}</td>
              <td className="px-stack-lg py-4">
                <div className="flex gap-2">
                  <RowAction disabled={savingId === t.id} onClick={() => resolve(t.id, 'done')}>Pass</RowAction>
                  <RowAction variant="outline" disabled={savingId === t.id} onClick={() => resolve(t.id, 'blocked')}>Fail / Log Bug</RowAction>
                </div>
              </td>
            </tr>
          ))}
          {!tasks.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">Nothing waiting for QA sign-off.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Support ----------
function TicketQueue({ accessToken, userId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [replyDraft, setReplyDraft] = useState({});
  const [openTicketId, setOpenTicketId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchTickets(accessToken, { limit: 100 }).then((r) => setTickets(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    try { await updateTicket(accessToken, id, { status }); load(); } finally { setSavingId(null); }
  };

  const assignToMe = async (id) => {
    setSavingId(id);
    try { await updateTicket(accessToken, id, { assigned_to: userId }); load(); } finally { setSavingId(null); }
  };

  const sendReply = async (id) => {
    const message = replyDraft[id];
    if (!message) return;
    setSavingId(id);
    try {
      await replyToTicket(accessToken, id, { message });
      setReplyDraft((prev) => ({ ...prev, [id]: '' }));
      setOpenTicketId(null);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-4">
      {tickets.map((t) => (
        <div key={t.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-display text-body-md font-semibold text-brand-dark dark:text-dark-brand">{t.subject}</p>
              <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.ticket_number}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant={TICKET_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
              <StatusBadge variant={TICKET_STATUS_COLOR[t.status]}>{t.status.replace('_', ' ')}</StatusBadge>
            </div>
          </div>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mb-3">{t.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            {!t.assigned_to && <RowAction disabled={savingId === t.id} onClick={() => assignToMe(t.id)}>Assign to me</RowAction>}
            <select value={t.status} disabled={savingId === t.id} onChange={(e) => changeStatus(t.id, e.target.value)}
              className="text-body-sm rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-2 py-1.5">
              {['open', 'in_progress', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <RowAction variant="outline" onClick={() => setOpenTicketId(openTicketId === t.id ? null : t.id)}>Reply</RowAction>
          </div>
          {openTicketId === t.id && (
            <div className="mt-3 flex gap-2">
              <textarea rows={2} value={replyDraft[t.id] || ''} onChange={(e) => setReplyDraft((prev) => ({ ...prev, [t.id]: e.target.value }))}
                placeholder="Type a reply..." className="flex-1 border border-outline-variant dark:border-dark-outline-variant rounded px-3 py-2 text-body-sm bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
              <RowAction disabled={savingId === t.id} onClick={() => sendReply(t.id)}>Send</RowAction>
            </div>
          )}
        </div>
      ))}
      {!tickets.length && <p className="text-body-sm text-ink-muted text-center py-8">No tickets in the queue.</p>}
    </div>
  );
}

// ---------- Finance ----------
function Invoices({ accessToken }) {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: '', amount: '', tax: '', currency: 'USD', issue_date: '', due_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchInvoices(accessToken, { limit: 100 }), fetchClients(accessToken, { limit: 100 })]).then(([i, c]) => {
      if (i.status === 'fulfilled') setInvoices(i.value?.data || []);
      if (c.status === 'fulfilled') setClients(c.value?.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const clientName = (id) => clients.find((c) => c.id === id)?.company_name || '—';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.amount || !form.issue_date || !form.due_date) return;
    setSubmitting(true);
    try {
      await createInvoice(accessToken, {
        client_id: form.client_id, amount: Number(form.amount), tax: form.tax ? Number(form.tax) : 0,
        currency: form.currency, issue_date: form.issue_date, due_date: form.due_date,
      });
      setForm({ client_id: '', amount: '', tax: '', currency: 'USD', issue_date: '', due_date: '' });
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const send = async (id) => {
    setActingId(id);
    try { await updateInvoice(accessToken, id, { status: 'sent' }); load(); } finally { setActingId(null); }
  };

  const markPaid = async (invoice) => {
    setActingId(invoice.id);
    try {
      await recordPayment(accessToken, invoice.id, { amount: invoice.total_amount, method: 'bank_transfer', paid_at: new Date().toISOString(), status: 'completed' });
      load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>New Invoice</Button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={FORM_INPUT_CLASS}>
              <option value="" disabled>Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.id}</option>)}
            </select>
            <input required type="number" min="0" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={FORM_INPUT_CLASS} />
            <input type="number" min="0" placeholder="Tax" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} className={FORM_INPUT_CLASS} />
            <input required type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className={FORM_INPUT_CLASS} />
            <input required type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={FORM_INPUT_CLASS} />
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={FORM_INPUT_CLASS}>
              {['USD', 'EUR', 'GBP', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
            <tr><th className="px-stack-lg py-4">Invoice</th><th className="px-stack-lg py-4">Client</th><th className="px-stack-lg py-4">Total</th><th className="px-stack-lg py-4">Due</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{inv.invoice_number}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{clientName(inv.client_id)}</td>
                <td className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-dark-brand">{inv.currency} {Number(inv.total_amount).toLocaleString()}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{inv.due_date}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={INVOICE_STATUS_COLOR[inv.status]}>{inv.status}</StatusBadge></td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    {inv.status === 'draft' && <RowAction disabled={actingId === inv.id} onClick={() => send(inv.id)}>Send</RowAction>}
                    {(inv.status === 'sent' || inv.status === 'overdue') && <RowAction disabled={actingId === inv.id} onClick={() => markPaid(inv)}>Record Payment</RowAction>}
                  </div>
                </td>
              </tr>
            ))}
            {!invoices.length && <tr><td colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- HR ----------
function LeaveApprovals({ accessToken }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    const params = { limit: 100 };
    if (filter !== 'all') params.status = filter;
    fetchLeaves(accessToken, params).then((r) => setLeaves(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken, filter]);

  // auto-refresh every 30s so new employee submissions appear
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, filter]);

  const review = async (id, status) => {
    setActingId(id);
    try {
      await reviewLeave(accessToken, id, status);
      showToast(`Leave ${status} successfully.`);
      load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setActingId(null);
    }
  };

  const LEAVE_STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'error', cancelled: 'neutral' };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-ink-muted">Filter:</span>
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded border font-label-caps text-label-caps uppercase transition-colors ${
                filter === s ? 'bg-brand text-white border-brand' : 'border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted hover:border-brand hover:text-brand'
              }`}>{s}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1 text-body-sm text-brand hover:text-brand-dark font-label-caps uppercase">
          <Icon name="refresh" className="text-base" /> Refresh
        </button>
      </div>
      {toast && (
        <p className={`text-body-sm rounded-lg py-2 px-4 ${
          toast.includes('success') || toast.includes('approved') || toast.includes('rejected')
            ? 'text-green-600 bg-green-50 border border-green-200'
            : 'text-red-600 bg-red-50 border border-red-200'
        }`}>{toast}</p>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
            <tr>
              <th className="px-stack-lg py-4">Employee</th>
              <th className="px-stack-lg py-4">Type</th>
              <th className="px-stack-lg py-4">From</th>
              <th className="px-stack-lg py-4">To</th>
              <th className="px-stack-lg py-4">Days</th>
              <th className="px-stack-lg py-4">Reason</th>
              <th className="px-stack-lg py-4">Status</th>
              <th className="px-stack-lg py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {leaves.map((l) => {
              const days = l.start_date && l.end_date
                ? Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1
                : '—';
              return (
                <tr key={l.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4">
                    <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{l.employee_code || '—'}</p>
                    {l.designation && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.designation}</p>}
                  </td>
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand capitalize">{l.type}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.start_date}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.end_date}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{days}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.reason || '—'}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={LEAVE_STATUS_COLOR[l.status]}>{l.status}</StatusBadge></td>
                  <td className="px-stack-lg py-4">
                    {l.status === 'pending' && (
                      <div className="flex gap-2">
                        <RowAction disabled={actingId === l.id} onClick={() => review(l.id, 'approved')}>Approve</RowAction>
                        <RowAction variant="outline" disabled={actingId === l.id} onClick={() => review(l.id, 'rejected')}>Reject</RowAction>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!leaves.length && <tr><td colSpan={8} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No leave requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Recruitment({ accessToken }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchApplications(accessToken, { limit: 100 }).then((r) => setApplications(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    try { await updateApplicationStatus(accessToken, id, status); load(); } finally { setSavingId(null); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted">
          <tr><th className="px-stack-lg py-4">Applicant</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {applications.map((a) => (
            <tr key={a.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{a.full_name}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{a.email}</td>
              <td className="px-stack-lg py-4">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={APPLICATION_STATUS_COLOR[a.status]}>{a.status}</StatusBadge>
                  <select value={a.status} disabled={savingId === a.id} onChange={(e) => changeStatus(a.id, e.target.value)}
                    className="text-body-sm rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-2 py-1">
                    {APPLICATION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </td>
            </tr>
          ))}
          {!applications.length && <tr><td colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No applications yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function EmployeePortal() {
  useDocumentTitle('Employee Portal | CoreFusion Technologies');
  const { user, initializing, accessToken, logout } = useAuth();
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
  const [leadsData, setLeadsData] = useState(demoLeads);
  const [proposalsData, setProposalsData] = useState(demoProposals);
  const [contractsData, setContractsData] = useState(demoContracts);
  // Dev-only: lets QA preview any role's tab set locally without needing a separate
  // seeded test account per role. Never rendered in production builds (see below) and
  // has no bearing on real permissions — the backend still enforces the logged-in
  // user's actual role on every API call.
  const [roleOverride, setRoleOverride] = useState(null);
  const effectiveRole = roleOverride || profile.role;
  const portalTabs = employeeTabsForRole(effectiveRole);

  const refreshCrm = () => {
    if (!accessToken) return;
    Promise.allSettled([fetchLeads(accessToken), fetchProposals(accessToken), fetchContracts(accessToken)])
      .then(([l, p, c]) => {
        if (l.status === 'fulfilled') setLeadsData(l.value?.data || []);
        if (p.status === 'fulfilled') setProposalsData(p.value?.data || []);
        if (c.status === 'fulfilled') setContractsData(c.value?.data || []);
      });
  };

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

  useEffect(() => {
    if (!empAuthed || effectiveRole !== 'sales' || !accessToken) return;
    refreshCrm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empAuthed, effectiveRole, accessToken]);

  // Reset to the first tab whenever the (real or previewed) role changes, since the
  // previously active tab may not exist in the new role's tab set.
  useEffect(() => {
    setActiveTab('overview');
  }, [effectiveRole]);

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
          <div className="flex items-center gap-3">
            {import.meta.env.DEV && (
              <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
                <span className="font-label-caps text-label-caps uppercase">Preview role</span>
                <select value={roleOverride || profile.role || ''} onChange={(e) => setRoleOverride(e.target.value === profile.role ? null : e.target.value)}
                  className="border border-outline-variant dark:border-dark-outline-variant rounded px-2 py-1.5 text-body-sm bg-white dark:bg-dark-surface">
                  {EMPLOYEE_ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}{r === profile.role ? ' (actual)' : ''}</option>
                  ))}
                </select>
              </label>
            )}
            <button onClick={() => { logout(); setEmpAuthed(false); }} className="border border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-brand hover:text-brand transition-all">
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-stack-lg border-b border-outline-variant dark:border-dark-outline-variant overflow-x-auto">
          {portalTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-brand dark:text-dark-brand border-brand dark:border-dark-brand' : 'text-ink-muted dark:text-dark-ink-muted border-transparent hover:text-brand dark:hover:text-dark-brand'
              }`}>
              <Icon name={tab.icon} className="text-lg" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <Overview profile={profile} attendance={attendance} leaves={leaves} timesheets={timesheets} payslips={payslips} />}
        {activeTab === 'leads' && <Leads leads={leadsData} accessToken={accessToken} onRefresh={refreshCrm} />}
        {activeTab === 'proposals' && <Proposals proposals={proposalsData} leads={leadsData} accessToken={accessToken} onRefresh={refreshCrm} />}
        {activeTab === 'contracts' && <Contracts contracts={contractsData} proposals={proposalsData} leads={leadsData} accessToken={accessToken} onRefresh={refreshCrm} />}
        {activeTab === 'marketing-leads' && <MarketingLeadsView accessToken={accessToken} />}
        {activeTab === 'testimonials' && <TestimonialModeration accessToken={accessToken} />}
        {activeTab === 'team-projects' && <TeamProjects accessToken={accessToken} userId={user?.id} />}
        {activeTab === 'task-board' && <TaskBoard accessToken={accessToken} userId={user?.id} />}
        {activeTab === 'approvals' && <Approvals accessToken={accessToken} />}
        {activeTab === 'test-queue' && <TestQueue accessToken={accessToken} />}
        {activeTab === 'ticket-queue' && <TicketQueue accessToken={accessToken} userId={user?.id} />}
        {activeTab === 'invoices' && <Invoices accessToken={accessToken} />}
        {activeTab === 'leave-approvals' && <LeaveApprovals accessToken={accessToken} />}
        {activeTab === 'recruitment' && <Recruitment accessToken={accessToken} />}
        {activeTab === 'attendance' && <Attendance attendance={attendance} employeeId={employeeId} />}
        {activeTab === 'leaves' && <Leaves leaves={leaves} employeeId={employeeId} accessToken={accessToken} />}
        {activeTab === 'timesheets' && <Timesheets timesheets={timesheets} employeeId={employeeId} accessToken={accessToken} />}
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
