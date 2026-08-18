import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import RowAction from '../components/ui/RowAction.jsx';
import { FORM_INPUT_CLASS } from '../components/ui/formClasses.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  employeeTabsForRole,
} from '../data/portal.js';
import { downloadDocumentPdf } from '../utils/documentPdf.js';
import {
  fetchMyProfile, applyLeave as applyLeaveApi, submitTimesheet, fetchMyDocuments,
  checkIn as checkInApi, checkOut as checkOutApi,
  fetchMyPayslips, fetchMyPerformanceReviews, fetchMyTrainingEnrollments,
  fetchTrainingCatalog, enrollInCourse,
} from '../api/employees.js';
import { apiRequest } from '../api/client.js';
import {
  fetchProposals, createProposal, sendProposal, acceptProposal, rejectProposal,
  fetchContracts, createContract, signContract,
  fetchLeads, createLead, updateLead,
} from '../api/crm.js';
import {
  fetchLeaves, reviewLeave, fetchAllTimesheets, reviewTimesheet,
  fetchApplications, updateApplicationStatus,
  fetchTickets, updateTicket, replyToTicket,
  fetchInvoices, createInvoice, updateInvoice, recordPayment,
  fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  fetchTasks, createTask, updateTaskStatus,
  assignProjectTeam, fetchAdminProjects, createProject,
  fetchClients, fetchEmployees,
} from '../api/admin.js';
function Overview({ profile, attendance, leaves, timesheets, payslips }) {
  const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          { label: 'Today', value: attendance.status, icon: 'clock_loader_60', sub: `${attendance.checkIn || '--'} - ${attendance.checkOut || '--'}` },
          { label: 'Hours This Week', value: `${totalHours}h`, icon: 'schedule' },
          { label: 'Pending Leaves', value: pendingLeaves, icon: 'beach_access' },
          { label: 'Latest Payslip', value: `$${payslips[0]?.netPay?.toLocaleString() || 0}`, icon: 'payments' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
              <Icon name={stat.icon} className="text-2xl text-blue-600" />
            </div>
            <p className="font-stat text-3xl font-bold capitalize text-slate-900">{stat.value}</p>
            <p className="mt-1 font-label-caps text-label-caps uppercase text-slate-500">{stat.label}</p>
            {stat.sub && <p className="mt-1 text-body-sm text-slate-400">{stat.sub}</p>}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-display text-headline-sm text-slate-900">My Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Name', value: profile.name },
            { label: 'Employee Code', value: profile.employee_code },
            { label: 'Designation', value: profile.designation },
            { label: 'Department', value: profile.department },
            { label: 'Email', value: profile.email },
            { label: 'Status', value: profile.status },
          ].map((f) => (
            <div key={f.label}>
              <span className="font-label-caps text-label-caps text-slate-500">{f.label}</span>
              <p className="text-body-md capitalize text-slate-900">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Attendance({ attendance, accessToken, onChange }) {
  const today = new Date().toISOString().slice(0, 10);
  const isToday = attendance.date === today;
  const [checkedIn, setCheckedIn] = useState(isToday && Boolean(attendance.checkIn));
  const [checkedOut, setCheckedOut] = useState(isToday && Boolean(attendance.checkOut));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const t = new Date().toISOString().slice(0, 10);
    const dayMatch = attendance.date === t;
    setCheckedIn(dayMatch && Boolean(attendance.checkIn));
    setCheckedOut(dayMatch && Boolean(attendance.checkOut));
  }, [attendance.date, attendance.checkIn, attendance.checkOut]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = accessToken ? await checkInApi(accessToken) : null;
      const updated = res?.data;
      const time = toLocalTime(updated?.check_in) || currentTime();
      onChange?.({ ...attendance, checkIn: time, status: 'present' });
      setCheckedIn(true);
      showToast(`Checked in at ${time}`);
    } catch {
      const time = currentTime();
      onChange?.({ ...attendance, checkIn: time, status: 'present' });
      setCheckedIn(true);
      showToast(`Checked in at ${time}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = accessToken ? await checkOutApi(accessToken) : null;
      const updated = res?.data;
      const time = toLocalTime(updated?.check_out) || currentTime();
      onChange?.({ ...attendance, checkOut: time });
      setCheckedOut(true);
      showToast(`Checked out at ${time}`);
    } catch {
      const time = currentTime();
      onChange?.({ ...attendance, checkOut: time });
      setCheckedOut(true);
      showToast(`Checked out at ${time}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-stack-lg">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-display text-headline-sm text-slate-900">Today&apos;s Attendance</h3>
        <div className="mb-6 grid gap-gutter sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-stack-lg text-center">
            <Icon name="login" className="mb-2 text-3xl text-blue-600" />
            <p className="font-label-caps text-label-caps text-blue-600">Check-In</p>
            <p className="font-display text-headline-sm text-blue-600">{attendance.checkIn || '--'}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-stack-lg text-center">
            <Icon name="logout" className="mb-2 text-3xl text-blue-600" />
            <p className="font-label-caps text-label-caps text-blue-600">Check-Out</p>
            <p className="font-display text-headline-sm text-blue-600">{attendance.checkOut || '--'}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-stack-lg text-center">
            <Icon name="badge" className="mb-2 text-3xl text-blue-600" />
            <p className="font-label-caps text-label-caps text-blue-600">Status</p>
            <StatusBadge variant={attendance.status === 'present' ? 'success' : 'warning'} className="mt-1">
              {attendance.status || 'Not checked in'}
            </StatusBadge>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={handleCheckIn} variant={checkedIn ? 'outline' : 'primary'} size="md" disabled={checkedIn || loading} icon={<Icon name="login" />}>
            {loading && !checkedIn ? 'Checking in...' : checkedIn ? 'Checked In ✓' : 'Check In'}
          </Button>
          <Button onClick={handleCheckOut} variant={checkedOut ? 'outline' : 'primary'} size="md" disabled={checkedOut || !checkedIn || loading} icon={<Icon name="logout" />}>
            {loading && checkedIn && !checkedOut ? 'Checking out...' : checkedOut ? 'Checked Out ✓' : 'Check Out'}
          </Button>
        </div>
        {toast && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-center text-body-sm text-green-600">
            ✓ {toast}
          </p>
        )}
      </div>
    </div>
  );
}

function Leaves({ leaves: initialLeaves, accessToken }) {
  const [showForm, setShowForm] = useState(false);
  const LEAVE_TYPES = [
    { label: 'Earned (Annual)', value: 'earned' },
    { label: 'Sick', value: 'sick' },
    { label: 'Casual (Personal)', value: 'casual' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Maternity', value: 'maternity' },
    { label: 'Paternity', value: 'paternity' },
  ];
  const [form, setForm] = useState({ type: 'earned', from: '', to: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [allLeaves, setAllLeaves] = useState(initialLeaves);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const validate = () => {
    const errs = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.type) errs.type = 'Leave type is required.';
    if (!form.from) {
      errs.from = 'Start date is required.';
    } else if (new Date(form.from) < today) {
      errs.from = 'Start date cannot be in the past.';
    }
    if (!form.to) {
      errs.to = 'End date is required.';
    } else if (form.from && new Date(form.to) < new Date(form.from)) {
      errs.to = 'End date cannot be before start date.';
    }
    if (!form.reason || !form.reason.trim()) {
      errs.reason = 'Reason is required.';
    } else if (form.reason.trim().length < 10) {
      errs.reason = 'Reason must be at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let newLeave;
      if (accessToken) {
        const res = await applyLeaveApi(accessToken, {
          type: form.type,
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
      setForm({ type: 'earned', from: '', to: '', reason: '' });
      setErrors({});
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
        <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>Apply Leave</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.type ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`}>
                {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.type && <p className="mt-1 text-body-xs text-red-500">{errors.type}</p>}
            </div>
            <div>
              <input type="date" value={form.from} onChange={(e) => handleChange('from', e.target.value)}
                className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.from ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`} />
              {errors.from && <p className="mt-1 text-body-xs text-red-500">{errors.from}</p>}
            </div>
            <div>
              <input type="date" value={form.to} onChange={(e) => handleChange('to', e.target.value)}
                className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.to ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`} />
              {errors.to && <p className="mt-1 text-body-xs text-red-500">{errors.to}</p>}
            </div>
          </div>
          <div>
            <textarea placeholder="Reason for leave (min 10 characters)" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)}
              rows={2} className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.reason ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`} />
            {errors.reason && <p className="mt-1 text-body-xs text-red-500">{errors.reason}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      )}
      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('success') ? 'border border-green-500/30 bg-green-500/10 text-green-300' : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr><th className="px-stack-lg py-4">Type</th><th className="px-stack-lg py-4">From</th><th className="px-stack-lg py-4">To</th><th className="px-stack-lg py-4">Days</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allLeaves.length === 0 ? (
              <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No leave requests yet.</td></tr>
            ) : allLeaves.map((l) => (
              <tr key={l.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4 text-body-md capitalize text-slate-900">{l.type}</td>
                <td className="px-stack-lg py-4 text-body-md text-slate-600">{l.from}</td>
                <td className="px-stack-lg py-4 text-body-md text-slate-600">{l.to}</td>
                <td className="px-stack-lg py-4 text-body-md text-slate-600">{l.days}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={l.status === 'approved' ? 'success' : l.status === 'pending' ? 'warning' : 'error'}>{l.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Timesheets({ timesheets: initialTimesheets, accessToken }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', project: '', hours: '', description: '' });
  const [errors, setErrors] = useState({});
  const [allEntries, setAllEntries] = useState(initialTimesheets);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const totalHours = allEntries.reduce((s, e) => s + (Number(e.hours) || 0), 0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const validate = () => {
    const errs = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (!form.date) {
      errs.date = 'Date is required.';
    } else if (new Date(form.date) > today) {
      errs.date = 'Date cannot be in the future.';
    }
    if (!form.hours) {
      errs.hours = 'Hours are required.';
    } else if (isNaN(Number(form.hours)) || Number(form.hours) <= 0) {
      errs.hours = 'Hours must be a positive number.';
    } else if (Number(form.hours) > 24) {
      errs.hours = 'Cannot log more than 24 hours per entry.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const refresh = async () => {
    if (!accessToken) return;
    try {
      const res = await apiRequest('/employees/me/timesheets', { token: accessToken });
      setAllEntries(normalizeTimesheets(res?.data));
      showToast('Timesheets refreshed.');
    } catch (err) {
      showToast(err?.message || 'Refresh failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        date: form.date,
        hours: parseFloat(form.hours),
        description: form.description || null,
      };
      const res = await submitTimesheet(accessToken, payload);
      const d = res?.data;
      const entry = { id: d.id, date: d.date, project: form.project || 'General', hours: Number(d.hours), description: d.description };
      setAllEntries((prev) => [entry, ...prev]);
      setForm({ date: '', project: '', hours: '', description: '' });
      setErrors({});
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
        <p className="text-body-md text-slate-600">Total hours logged: <span className="font-semibold text-slate-900">{totalHours}h</span></p>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-light">
            <Icon name="refresh" className="text-base" /> Refresh
          </button>
          <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>Log Hours</Button>
        </div>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)}
                className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.date ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`} />
              {errors.date && <p className="mt-1 text-body-xs text-red-400">{errors.date}</p>}
            </div>
            <input type="text" placeholder="Project name (optional)" value={form.project} onChange={(e) => handleChange('project', e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none" />
            <div>
              <input type="number" step="0.25" min="0.25" max="24" placeholder="Hours *" value={form.hours} onChange={(e) => handleChange('hours', e.target.value)}
                className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.hours ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`} />
              {errors.hours && <p className="mt-1 text-body-xs text-red-400">{errors.hours}</p>}
            </div>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)}
            rows={2} className="w-full rounded border border-slate-200 bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none" />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Logging...' : 'Log'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      )}
      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('success') || toast.includes('refreshed') ? 'border border-green-500/30 bg-green-500/10 text-green-300' : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-400">
            <tr><th className="px-stack-lg py-4">Date</th><th className="px-stack-lg py-4">Project</th><th className="px-stack-lg py-4">Hours</th><th className="px-stack-lg py-4">Description</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allEntries.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4 text-body-md text-slate-600">{e.date}</td>
                <td className="px-stack-lg py-4 text-body-md text-slate-900">{e.project}</td>
                <td className="px-stack-lg py-4 text-body-md text-slate-900">{e.hours}h</td>
                <td className="px-stack-lg py-4 text-body-md text-slate-600">{e.description || '—'}</td>
              </tr>
            ))}
            {!allEntries.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-slate-900/40">No timesheets logged yet. Click &ldquo;Log Hours&rdquo; to get started.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Payslips({ payslips }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <table className="w-full text-left">
        <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
          <tr><th className="px-stack-lg py-4">Period</th><th className="px-stack-lg py-4">Gross</th><th className="px-stack-lg py-4">Deductions</th><th className="px-stack-lg py-4">Net Pay</th><th className="px-stack-lg py-4">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {payslips.length === 0 ? (
            <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No payslips available yet.</td></tr>
          ) : payslips.map((p) => (
            <tr key={`${p.month}-${p.year}`} className="transition-colors hover:bg-blue-50">
              <td className="px-stack-lg py-4 text-body-md text-slate-900">{p.month} {p.year}</td>
              <td className="px-stack-lg py-4 text-body-md text-slate-600">${p.grossPay.toLocaleString()}</td>
              <td className="px-stack-lg py-4 text-body-md text-slate-600">${p.deductions.toLocaleString()}</td>
              <td className="px-stack-lg py-4 text-body-md font-semibold text-slate-900">${p.netPay.toLocaleString()}</td>
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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <table className="w-full text-left">
        <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
          <tr><th className="px-stack-lg py-4">Task</th><th className="px-stack-lg py-4">Project</th><th className="px-stack-lg py-4">Priority</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Due</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tasks.length === 0 ? (
            <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No tasks assigned yet.</td></tr>
          ) : tasks.map((t) => (
            <tr key={t.id} className="transition-colors hover:bg-blue-50">
              <td className="px-stack-lg py-4 text-body-md text-slate-900">{t.title}</td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-600">{t.project}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={priorityColor[t.priority]}>{t.priority}</StatusBadge></td>
              <td className="px-stack-lg py-4"><StatusBadge variant={statusColor[t.status]}>{t.status.replace('_', ' ')}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-600">{t.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Projects({ projects }) {
  const statusColor = { completed: 'success', in_progress: 'info', on_hold: 'warning', planning: 'neutral' };
  const completed = projects.filter((p) => p.status === 'completed').length;
  const inProgress = projects.filter((p) => p.status === 'in_progress').length;
  const kpis = [
    { label: 'Total Projects', value: projects.length, icon: 'folder' },
    { label: 'In Progress', value: inProgress, icon: 'pending' },
    { label: 'Completed', value: completed, icon: 'check_circle' },
  ];
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
        {kpis.map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
              <Icon name={stat.icon} className="text-2xl text-blue-600" />
            </div>
            <p className="font-stat text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 font-label-caps text-label-caps uppercase text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <section>
        <h3 className="mb-4 font-display text-headline-sm text-slate-900">Assigned Projects</h3>
        {projects.length === 0 && <p className="py-8 text-center text-body-sm text-slate-600">No projects assigned yet.</p>}
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-display text-body-md font-semibold text-slate-900">{p.title}</p>
              <p className="mt-1 text-body-xs uppercase tracking-wide text-slate-600">Deadline: {p.deadline}</p>
              <p className="mt-2 flex-1 text-body-sm text-slate-600">Role: {p.role}</p>
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge variant={statusColor[p.status]}>{p.status.replace('_', ' ')}</StatusBadge>
                <span className="text-body-sm font-semibold text-slate-900">{p.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Performance({ reviews }) {
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const totalGoals = reviews.reduce((s, r) => s + r.goals, 0);
  const totalAchieved = reviews.reduce((s, r) => s + r.achieved, 0);
  const kpis = [
    { label: 'Total Reviews', value: reviews.length, icon: 'reviews' },
    { label: 'Avg Rating', value: `${avgRating}/5`, icon: 'star' },
    { label: 'Goals Achieved', value: `${totalAchieved}/${totalGoals}`, icon: 'flag' },
  ];
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
        {kpis.map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
              <Icon name={stat.icon} className="text-2xl text-blue-600" />
            </div>
            <p className="font-stat text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 font-label-caps text-label-caps uppercase text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <section>
        <h3 className="mb-4 font-display text-headline-sm text-slate-900">Performance Reviews</h3>
        {reviews.length === 0 && <p className="py-8 text-center text-body-sm text-slate-600">No performance reviews yet.</p>}
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.period} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-display text-body-md font-semibold text-slate-900">{r.period}</p>
              <p className="mt-1 text-body-xs uppercase tracking-wide text-slate-600">Goals Set: {r.goals} &middot; Achieved: {r.achieved}</p>
              <p className="mt-2 flex-1 text-body-sm text-slate-600">&ldquo;{r.feedback}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Icon name="star" className="text-xl text-yellow-400" />
                  <span className="font-stat text-body-md font-semibold text-slate-900">{r.rating}/5</span>
                </div>
                <span className="text-body-sm text-slate-600">{Math.round((r.achieved / r.goals) * 100)}% achieved</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Training({ courses, catalog, onEnroll, enrollingId }) {
  const statusColor = { completed: 'success', in_progress: 'info', pending: 'neutral' };
  const enrolledIds = new Set(courses.map((c) => c.courseId ?? c.id));
  const available = (catalog || []).filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="space-y-stack-lg">
      {available.length > 0 && (
        <section>
          <h3 className="mb-4 font-display text-headline-sm text-slate-900">Available Courses</h3>
          <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {available.map((c) => (
              <div key={c.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="font-display text-body-md font-semibold text-slate-900">{c.title}</p>
                <p className="mt-1 text-body-xs uppercase tracking-wide text-slate-600">{c.category}</p>
                <p className="mt-2 flex-1 text-body-sm text-slate-600">{c.description || 'No description available.'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-body-sm text-slate-600">
                    {c.duration_hours ? `${c.duration_hours}h` : 'Self-paced'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEnroll(c.id)}
                    disabled={enrollingId === c.id}
                    className="inline-flex items-center gap-1.5 rounded bg-brand px-4 py-2 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                  >
                    <Icon name="school" className="text-base leading-none" />
                    {enrollingId === c.id ? 'Enrolling...' : 'Enroll'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="mb-4 font-display text-headline-sm text-slate-900">My Enrollments</h3>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <table className="w-full text-left">
            <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
              <tr><th className="px-stack-lg py-4">Course</th><th className="px-stack-lg py-4">Category</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Completed On</th><th className="px-stack-lg py-4">Score</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {courses.length === 0 ? (
                <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No enrollments yet. Browse available courses above.</td></tr>
              ) : courses.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-blue-50">
                  <td className="px-stack-lg py-4 text-body-md text-slate-900">{c.title}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-slate-600">{c.category}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={statusColor[c.status]}>{c.status.replace('_', ' ')}</StatusBadge></td>
                  <td className="px-stack-lg py-4 text-body-sm text-slate-600">{c.completedOn || '—'}</td>
                  <td className="px-stack-lg py-4 text-body-sm font-semibold text-slate-900">{c.score || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Documents({ docs }) {
  const typeIcon = { contract: 'gavel', id_proof: 'badge', certificate: 'workspace_premium', other: 'description', resume: 'person' };
  const contracts = docs.filter((d) => d.type === 'contract').length;
  const certs = docs.filter((d) => d.type === 'certificate').length;
  const kpis = [
    { label: 'Total Documents', value: docs.length, icon: 'description' },
    { label: 'Contracts', value: contracts, icon: 'gavel' },
    { label: 'Certificates', value: certs, icon: 'workspace_premium' },
  ];

  const handleDownload = async (d) => {
    if (d.file_url) {
      window.open(d.file_url, '_blank');
      return;
    }
    await downloadDocumentPdf(d);
  };

  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
        {kpis.map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
              <Icon name={stat.icon} className="text-2xl text-blue-600" />
            </div>
            <p className="font-stat text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 font-label-caps text-label-caps uppercase text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <section>
        <h3 className="mb-4 font-display text-headline-sm text-slate-900">My Documents</h3>
        {docs.length === 0 && <p className="py-8 text-center text-body-sm text-slate-600">No documents available yet.</p>}
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div key={d.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
                <Icon name={typeIcon[d.type] || 'description'} className="text-2xl text-blue-600" />
              </div>
              <p className="font-display text-body-md font-semibold text-slate-900">{d.name}</p>
              <p className="mt-1 text-body-xs uppercase tracking-wide text-slate-600">{d.type.replace('_', ' ')}{d.size ? ` · ${d.size}` : ''}</p>
              <p className="mt-2 flex-1 text-body-sm text-slate-600">{d.uploadedOn}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-body-sm text-slate-600">Document</span>
                <button
                  onClick={() => handleDownload(d)}
                  className="inline-flex items-center gap-1.5 rounded bg-brand px-4 py-2 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                  aria-label="Download">
                  <Icon name="download" className="text-base leading-none" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const LEAD_STATUS_OPTIONS = ['new', 'contacted', 'requirement_gathering', 'proposal_sent', 'proposal_approved', 'converted', 'disqualified'];
const LEAD_SOURCE_OPTIONS = ['website', 'contact_form', 'referral', 'campaign', 'cold_outreach', 'event', 'other'];
const LEAD_STATUS_COLOR = { new: 'neutral', contacted: 'info', requirement_gathering: 'info', proposal_sent: 'warning', proposal_approved: 'success', converted: 'success', disqualified: 'error' };
const PROPOSAL_STATUS_COLOR = { draft: 'neutral', sent: 'warning', viewed: 'info', accepted: 'success', rejected: 'error' };
const CONTRACT_STATUS_COLOR = { pending: 'warning', signed: 'success', void: 'error' };

function Leads({ leads, accessToken, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', phone: '', source: 'website', estimated_value: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState('');
  const inputClass = 'border border-slate-200 rounded px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:border-brand';

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const validate = () => {
    const errs = {};
    if (!form.contact_name || !form.contact_name.trim()) {
      errs.contact_name = 'Contact name is required.';
    } else if (form.contact_name.trim().length < 2) {
      errs.contact_name = 'Contact name must be at least 2 characters.';
    }
    if (!form.email || !form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (form.phone && !/^[+]?[\d\s\-()]{7,20}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number.';
    }
    if (form.estimated_value && (isNaN(Number(form.estimated_value)) || Number(form.estimated_value) < 0)) {
      errs.estimated_value = 'Enter a valid amount.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createLead(accessToken, { ...form, estimated_value: form.estimated_value ? Number(form.estimated_value) : null });
      setForm({ company: '', contact_name: '', email: '', phone: '', source: 'website', estimated_value: '' });
      setErrors({});
      setShowForm(false);
      onRefresh();
      showToast('Lead saved successfully.');
    } catch (err) {
      showToast(err?.message || 'Failed to save lead.');
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
        <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>New Lead</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <input type="text" placeholder="Company (optional)" value={form.company} onChange={(e) => handleChange('company', e.target.value)} className={inputClass} />
            </div>
            <div>
              <input type="text" placeholder="Contact name *" value={form.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} className={`${inputClass} ${errors.contact_name ? 'border-red-400' : ''}`} />
              {errors.contact_name && <p className="mt-1 text-body-xs text-red-500">{errors.contact_name}</p>}
            </div>
            <div>
              <input type="email" placeholder="Email *" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`} />
              {errors.email && <p className="mt-1 text-body-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`} />
              {errors.phone && <p className="mt-1 text-body-xs text-red-500">{errors.phone}</p>}
            </div>
            <select value={form.source} onChange={(e) => handleChange('source', e.target.value)} className={inputClass}>
              {LEAD_SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <div>
              <input type="number" min="0" placeholder="Estimated value ($)" value={form.estimated_value} onChange={(e) => handleChange('estimated_value', e.target.value)} className={`${inputClass} ${errors.estimated_value ? 'border-red-400' : ''}`} />
              {errors.estimated_value && <p className="mt-1 text-body-xs text-red-500">{errors.estimated_value}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Lead'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      )}
      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('successfully') ? 'border border-green-500/30 bg-green-500/10 text-green-300' : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr><th className="px-stack-lg py-4">Company / Contact</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Source</th><th className="px-stack-lg py-4">Est. Value</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {leads.map((l) => (
              <tr key={l.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4">
                  <p className="text-body-md font-semibold text-slate-900">{l.company || '—'}</p>
                  <p className="text-body-sm text-slate-600">{l.contact_name}</p>
                </td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{l.email}</td>
                <td className="px-stack-lg py-4 text-body-sm capitalize text-slate-600">{l.source?.replace('_', ' ')}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-900">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : '—'}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={LEAD_STATUS_COLOR[l.status]}>{l.status?.replace('_', ' ')}</StatusBadge>
                    <select value={l.status} disabled={savingId === l.id || !accessToken} onChange={(e) => handleStatusChange(l.id, e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-body-sm disabled:opacity-50">
                      {LEAD_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No leads yet.</td></tr>
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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);
  const inputClass = 'border border-slate-200 rounded px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:border-brand';

  const leadLabel = (leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    return lead ? (lead.company || lead.contact_name) : 'Unknown lead';
  };

  const validate = () => {
    const errs = {};
    if (!form.lead_id) {
      errs.lead_id = 'Please select a lead.';
    }
    if (!form.scope_summary || !form.scope_summary.trim()) {
      errs.scope_summary = 'Scope summary is required.';
    } else if (form.scope_summary.trim().length < 10) {
      errs.scope_summary = 'Scope summary must be at least 10 characters.';
    }
    if (!form.price) {
      errs.price = 'Price is required.';
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errs.price = 'Price must be a positive number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createProposal(accessToken, { ...form, price: Number(form.price) });
      setForm({ lead_id: '', scope_summary: '', price: '', currency: 'USD' });
      setErrors({});
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
        <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>New Proposal</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <select value={form.lead_id} onChange={(e) => handleChange('lead_id', e.target.value)} className={`${inputClass} ${errors.lead_id ? 'border-red-400' : ''}`}>
                <option value="" disabled>Select lead *</option>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.company || l.contact_name}</option>)}
              </select>
              {errors.lead_id && <p className="mt-1 text-body-xs text-red-500">{errors.lead_id}</p>}
            </div>
            <div>
              <input type="number" min="0" placeholder="Price *" value={form.price} onChange={(e) => handleChange('price', e.target.value)} className={`${inputClass} ${errors.price ? 'border-red-400' : ''}`} />
              {errors.price && <p className="mt-1 text-body-xs text-red-500">{errors.price}</p>}
            </div>
            <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} className={inputClass}>
              {['USD', 'EUR', 'GBP', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <textarea placeholder="Scope summary *" value={form.scope_summary} onChange={(e) => handleChange('scope_summary', e.target.value)} rows={3} className={`w-full ${inputClass} ${errors.scope_summary ? 'border-red-400' : ''}`} />
            {errors.scope_summary && <p className="mt-1 text-body-xs text-red-500">{errors.scope_summary}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Draft'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr><th className="px-stack-lg py-4">Lead</th><th className="px-stack-lg py-4">Price</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Sent</th><th className="px-stack-lg py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {proposals.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4 text-body-md text-slate-900">{leadLabel(p.lead_id)}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{p.currency} {Number(p.price).toLocaleString()}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={PROPOSAL_STATUS_COLOR[p.status]}>{p.status}</StatusBadge></td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{p.sent_at ? p.sent_at.slice(0, 10) : '—'}</td>
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
              <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No proposals yet.</td></tr>
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
      <table className="w-full text-left">
        <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
          <tr><th className="px-stack-lg py-4">Deal</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Client Signed</th><th className="px-stack-lg py-4">Company Signed</th><th className="px-stack-lg py-4">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {contracts.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-blue-50">
              <td className="px-stack-lg py-4 text-body-md text-slate-900">{describe(c.proposal_id)}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={CONTRACT_STATUS_COLOR[c.status]}>{c.status}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-600">{c.signed_by_client_at ? c.signed_by_client_at.slice(0, 10) : '—'}</td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-600">{c.signed_by_company_at ? c.signed_by_company_at.slice(0, 10) : '—'}</td>
              <td className="px-stack-lg py-4">
                {c.status === 'pending' && <RowAction disabled={actingId === c.id} onClick={() => handleSign(c.id)}>Mark Signed</RowAction>}
              </td>
            </tr>
          ))}
          {!contracts.length && (
            <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No contracts yet — generate one from an accepted proposal.</td></tr>
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
      <table className="w-full text-left">
        <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
          <tr><th className="px-stack-lg py-4">Company / Contact</th><th className="px-stack-lg py-4">Source</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Est. Value</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {leads.map((l) => (
            <tr key={l.id} className="transition-colors hover:bg-blue-50">
              <td className="px-stack-lg py-4">
                <p className="text-body-md font-semibold text-slate-900">{l.company || '—'}</p>
                <p className="text-body-sm text-slate-600">{l.contact_name}</p>
              </td>
              <td className="px-stack-lg py-4 text-body-sm capitalize text-slate-600">{l.source?.replace('_', ' ')}</td>
              <td className="px-stack-lg py-4"><StatusBadge variant={LEAD_STATUS_COLOR[l.status]}>{l.status?.replace('_', ' ')}</StatusBadge></td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-900">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : '—'}</td>
            </tr>
          ))}
          {!leads.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No leads yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TestimonialModeration({ accessToken }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author_name: '', author_title: '', company_name: '', rating: 5, content: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchTestimonials(accessToken, { limit: 100 })
      .then((r) => { setItems(r?.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  const validate = () => {
    const errs = {};
    if (!form.author_name.trim()) errs.author_name = 'Author name is required.';
    if (!form.content.trim()) errs.content = 'Testimonial content is required.';
    if (form.content.trim().length < 10) errs.content = 'Content must be at least 10 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createTestimonial(accessToken, { ...form, is_published: false });
      setForm({ author_name: '', author_title: '', company_name: '', rating: 5, content: '' });
      setErrors({});
      setShowForm(false);
      showToast('Testimonial created successfully.');
      load();
    } catch (err) {
      showToast(err?.message || 'Failed to create testimonial.');
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async (id) => {
    setActingId(id);
    try {
      await updateTestimonial(accessToken, id, { is_published: true });
      showToast('Testimonial approved and published.');
      load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setActingId(null);
    }
  };

  const unpublish = async (id) => {
    setActingId(id);
    try {
      await updateTestimonial(accessToken, id, { is_published: false });
      showToast('Testimonial unpublished.');
      load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setActingId(null);
    }
  };

  const remove = async (id) => {
    setActingId(id);
    try {
      await deleteTestimonial(accessToken, id);
      showToast('Testimonial deleted.');
      load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setActingId(null);
    }
  };

  const pending = items.filter((t) => !t.is_published);
  const published = items.filter((t) => t.is_published);
  const visible = filter === 'pending' ? pending : filter === 'published' ? published : items;

  const kpis = [
    { label: 'Pending Moderation', value: pending.length, icon: 'rate_review' },
    { label: 'Published', value: published.length, icon: 'publish' },
    { label: 'Total Reviews', value: items.length, icon: 'reviews' },
  ];

  const stars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} name={i < (rating || 0) ? 'star' : 'star_outline'} className="text-base text-yellow-400" />
  ));

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
        {kpis.map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
              <Icon name={stat.icon} className="text-2xl text-blue-600" />
            </div>
            <p className="font-stat text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 font-label-caps text-label-caps uppercase text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-slate-900">Filter:</span>
          {['pending', 'published', 'all'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
                filter === s ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
              }`}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>New Testimonial</Button>
          <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-slate-900">
            <Icon name="refresh" className="text-base" /> Refresh
          </button>
        </div>
      </div>

      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('success') || toast.includes('published') || toast.includes('deleted')
            ? 'border border-green-200 bg-green-50 text-green-700'
            : 'border border-red-200 bg-red-50 text-red-700'
        }`}>{toast}</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-label-caps text-label-caps uppercase text-slate-600">Author Name *</label>
              <input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.author_name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`}
                placeholder="John Doe" />
              {errors.author_name && <p className="mt-1 text-body-xs text-red-500">{errors.author_name}</p>}
            </div>
            <div>
              <label className="mb-1 block font-label-caps text-label-caps uppercase text-slate-600">Title / Role</label>
              <input type="text" value={form.author_title} onChange={(e) => setForm({ ...form, author_title: e.target.value })}
                className="w-full rounded border border-slate-200 bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none"
                placeholder="CEO at Acme Inc." />
            </div>
            <div>
              <label className="mb-1 block font-label-caps text-label-caps uppercase text-slate-600">Company</label>
              <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full rounded border border-slate-200 bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none"
                placeholder="Acme Inc." />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label-caps text-label-caps uppercase text-slate-600">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
                  className="cursor-pointer">
                  <Icon name={r <= form.rating ? 'star' : 'star_outline'} className="text-2xl text-yellow-400" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label-caps text-label-caps uppercase text-slate-600">Testimonial *</label>
            <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`w-full rounded border bg-white px-4 py-3 text-body-md text-slate-900 placeholder-slate-400 focus:outline-none ${errors.content ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'}`}
              placeholder="Write the testimonial content..." />
            {errors.content && <p className="mt-1 text-body-xs text-red-500">{errors.content}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Testimonial'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <div key={t.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
              <Icon name="person" className="text-2xl text-blue-600" />
            </div>
            <p className="font-display text-body-md font-semibold text-slate-900">{t.author_name}</p>
            <p className="mt-1 text-body-xs uppercase tracking-wide text-slate-600">{t.author_title}{t.company_name ? ` · ${t.company_name}` : ''}</p>
            <div className="mt-2 flex items-center gap-0.5">{stars(t.rating)}</div>
            <p className="mt-2 flex-1 text-body-sm italic text-slate-600">&ldquo;{t.content}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge variant={t.is_published ? 'success' : 'warning'}>{t.is_published ? 'published' : 'pending'}</StatusBadge>
              <div className="flex items-center gap-2">
                {!t.is_published && <RowAction disabled={actingId === t.id} onClick={() => approve(t.id)}>Approve</RowAction>}
                {t.is_published && <RowAction variant="outline" disabled={actingId === t.id} onClick={() => unpublish(t.id)}>Unpublish</RowAction>}
                <RowAction variant="outline" disabled={actingId === t.id} onClick={() => remove(t.id)}>Delete</RowAction>
              </div>
            </div>
          </div>
        ))}
        {!visible.length && <p className="col-span-full py-8 text-center text-body-sm text-slate-600">No testimonials to show.</p>}
      </div>
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

  const load = useCallback(() => {
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
  }, [accessToken, userId]);

  useEffect(() => { load();   }, [load]);

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
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
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
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-headline-sm text-slate-900">{p.title}</h3>
                <p className="text-body-sm text-slate-600">Client: {clientName(p.client_id)}{p.budget ? ` · Budget: $${Number(p.budget).toLocaleString()}` : ''}</p>
              </div>
              <StatusBadge variant={PROJECT_STATUS_COLOR[p.status]}>{p.status?.replace('_', ' ')}</StatusBadge>
            </div>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.progress_percent}%` }} />
              </div>
              <span className="w-10 text-right text-body-sm font-semibold text-slate-900">{p.progress_percent}%</span>
            </div>
            {assigningId === p.id ? (
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="font-label-caps text-label-caps uppercase text-slate-600">Select team members</p>
                <div className="flex flex-wrap gap-2">
                  {employees.map((emp) => (
                    <button key={emp.id} type="button" onClick={() => toggleTeamMember(emp.id)}
                      className={`rounded border px-3 py-1.5 text-body-sm transition-colors ${teamSelection.includes(emp.id) ? 'border-brand bg-brand text-white' : 'border-slate-200 text-slate-600 hover:border-brand'}`}>
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
        {!projects.length && <p className="py-8 text-center text-body-sm text-slate-600">No projects assigned to you yet.</p>}
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
     
  }, [accessToken, userId]);

  const loadTasks = useCallback(() => {
    if (!accessToken || !selectedProject) { setLoading(false); return; }
    setLoading(true);
    fetchTasks(accessToken, { project_id: selectedProject, limit: 100 }).then((r) => setTasks(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken, selectedProject]);

  useEffect(() => { loadTasks();   }, [loadTasks]);

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
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
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
        <div className="grid gap-gutter md:grid-cols-5">
          {TASK_STATUS_COLUMNS.map((col) => (
            <div key={col} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="font-label-caps text-label-caps uppercase text-slate-900">{col.replace('_', ' ')} ({tasks.filter((t) => t.status === col).length})</p>
              {tasks.filter((t) => t.status === col).map((t) => (
                <div key={t.id} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-body-sm font-semibold text-slate-900">{t.title}</p>
                  <StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
                  <select value={t.status} disabled={savingId === t.id} onChange={(e) => changeStatus(t.id, e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-body-sm text-slate-900">
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
  const [filter, setFilter] = useState('submitted');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAllTimesheets(accessToken, { limit: 100 })
      .then((r) => { setTimesheets(r?.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const review = async (id, status) => {
    setActingId(id);
    try {
      await reviewTimesheet(accessToken, id, status);
      showToast(`Timesheet ${status}.`);
      load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setActingId(null);
    }
  };

  const visible = filter === 'all' ? timesheets : timesheets.filter((t) => t.status === filter);
  const kpis = [
    { label: 'Pending Approval', value: timesheets.filter((t) => t.status === 'submitted').length, icon: 'pending_actions' },
    { label: 'Approved', value: timesheets.filter((t) => t.status === 'approved').length, icon: 'task_alt' },
    { label: 'Rejected', value: timesheets.filter((t) => t.status === 'rejected').length, icon: 'cancel' },
    { label: 'Total Entries', value: timesheets.length, icon: 'calendar_month' },
  ];

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
        {kpis.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Icon name={stat.icon} className="text-2xl text-brand" />
              <span className="font-label-caps text-label-caps text-slate-600">{stat.label}</span>
            </div>
            <p className="font-stat text-stat-lg text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-slate-900">Filter:</span>
          {['submitted', 'approved', 'rejected', 'all'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
                filter === s ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
              }`}>{s}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-slate-900">
          <Icon name="refresh" className="text-base" /> Refresh
        </button>
      </div>

      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('success') || toast.includes('approved') || toast.includes('rejected')
            ? 'border border-green-500/30 bg-green-500/10 text-green-300'
            : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr>
              <th className="px-stack-lg py-4">Employee</th>
              <th className="px-stack-lg py-4">Date</th>
              <th className="px-stack-lg py-4">Hours</th>
              <th className="px-stack-lg py-4">Description</th>
              <th className="px-stack-lg py-4">Status</th>
              <th className="px-stack-lg py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visible.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4">
                  <p className="text-body-md font-semibold text-slate-900">{t.employee_name || t.employee_code || '—'}</p>
                  {t.employee_code && t.employee_name && <p className="text-body-sm text-slate-600">{t.employee_code}</p>}
                </td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{t.date}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-900">{t.hours}h</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{t.description || '—'}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={TIMESHEET_STATUS_COLOR[t.status]}>{t.status}</StatusBadge></td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    <RowAction disabled={actingId === t.id} onClick={() => review(t.id, 'approved')}>Approve</RowAction>
                    <RowAction variant="outline" disabled={actingId === t.id} onClick={() => review(t.id, 'rejected')}>Reject</RowAction>
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length && <tr><td colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No timesheets to show.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- QA ----------
function TestQueue({ accessToken }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('in_review');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchTasks(accessToken, { limit: 100 })
      .then((r) => { setTasks(r?.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const resolve = async (id, status) => {
    setSavingId(id);
    try {
      await updateTaskStatus(accessToken, id, status);
      showToast(status === 'done' ? 'Task passed QA.' : 'Task blocked — bug logged.');
      load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setSavingId(null);
    }
  };

  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const kpis = [
    { label: 'In Review', value: tasks.filter((t) => t.status === 'in_review').length, icon: 'bug_report' },
    { label: 'Passed', value: tasks.filter((t) => t.status === 'done').length, icon: 'task_alt' },
    { label: 'Blocked / Bugs', value: tasks.filter((t) => t.status === 'blocked').length, icon: 'report' },
    { label: 'Total Tasks', value: tasks.length, icon: 'fact_check' },
  ];

  const TASK_STATUS_COLOR = { todo: 'neutral', in_progress: 'info', in_review: 'warning', done: 'success', blocked: 'error' };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
        {kpis.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Icon name={stat.icon} className="text-2xl text-brand" />
              <span className="font-label-caps text-label-caps text-slate-600">{stat.label}</span>
            </div>
            <p className="font-stat text-stat-lg text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-slate-900">Filter:</span>
          {['in_review', 'done', 'blocked', 'all'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
                filter === s ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
              }`}>{s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-slate-900">
          <Icon name="refresh" className="text-base" /> Refresh
        </button>
      </div>

      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('passed') || toast.includes('success')
            ? 'border border-green-500/30 bg-green-500/10 text-green-300'
            : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr>
              <th className="px-stack-lg py-4">Task</th>
              <th className="px-stack-lg py-4">Priority</th>
              <th className="px-stack-lg py-4">Status</th>
              <th className="px-stack-lg py-4">Due</th>
              <th className="px-stack-lg py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visible.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4 text-body-md text-slate-900">{t.title}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge></td>
                <td className="px-stack-lg py-4"><StatusBadge variant={TASK_STATUS_COLOR[t.status]}>{t.status?.replace('_', ' ')}</StatusBadge></td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{t.due_date || '—'}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    <RowAction disabled={savingId === t.id} onClick={() => resolve(t.id, 'done')}>Pass</RowAction>
                    <RowAction variant="outline" disabled={savingId === t.id} onClick={() => resolve(t.id, 'blocked')}>Fail / Log Bug</RowAction>
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length && <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">Nothing waiting for QA sign-off.</td></tr>}
          </tbody>
        </table>
      </div>
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
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const isRealId = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? '');

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchTickets(accessToken, { limit: 100 })
      .then((r) => { setTickets(r?.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    try {
      if (isRealId(id)) {
        await updateTicket(accessToken, id, { status });
      } else {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      }
      showToast(`Ticket ${status.replace('_', ' ')}.`);
      if (isRealId(id)) load();
    } catch (err) {
      showToast(err?.message || 'Action failed.');
    } finally {
      setSavingId(null);
    }
  };

  const assignToMe = async (id) => {
    setSavingId(id);
    try {
      if (isRealId(id)) {
        await updateTicket(accessToken, id, { assigned_to: userId });
      } else {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assigned_to: userId || 'u-support' } : t)));
      }
      showToast('Ticket assigned to you.');
      if (isRealId(id)) load();
    } catch (err) {
      showToast(err?.message || 'Assignment failed.');
    } finally {
      setSavingId(null);
    }
  };

  const sendReply = async (id) => {
    const message = replyDraft[id];
    if (!message) return;
    setSavingId(id);
    try {
      if (isRealId(id)) {
        await replyToTicket(accessToken, id, { message });
      }
      setReplyDraft((prev) => ({ ...prev, [id]: '' }));
      setOpenTicketId(null);
      showToast('Reply sent.');
    } catch (err) {
      showToast(err?.message || 'Reply failed.');
    } finally {
      setSavingId(null);
    }
  };

  const visible = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
  const kpis = [
    { label: 'Open', value: tickets.filter((t) => t.status === 'open').length, icon: 'confirmation_number' },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length, icon: 'pending_actions' },
    { label: 'Resolved', value: tickets.filter((t) => t.status === 'resolved').length, icon: 'task_alt' },
    { label: 'Unassigned', value: tickets.filter((t) => !t.assigned_to).length, icon: 'person_off' },
  ];

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
        {kpis.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Icon name={stat.icon} className="text-2xl text-brand" />
              <span className="font-label-caps text-label-caps text-slate-600">{stat.label}</span>
            </div>
            <p className="font-stat text-stat-lg text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-slate-900">Filter:</span>
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
                filter === s ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
              }`}>{s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-slate-900">
          <Icon name="refresh" className="text-base" /> Refresh
        </button>
      </div>

      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('sent') || toast.includes('assigned') || toast.includes('resolved') || toast.includes('closed')
            ? 'border border-green-500/30 bg-green-500/10 text-green-300'
            : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}

      <div className="space-y-4">
        {visible.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-body-md font-semibold text-slate-900">{t.subject}</p>
                <p className="text-body-sm text-slate-600">{t.ticket_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge variant={TICKET_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
                <StatusBadge variant={TICKET_STATUS_COLOR[t.status]}>{t.status.replace('_', ' ')}</StatusBadge>
              </div>
            </div>
            <p className="mb-3 text-body-sm text-slate-600">{t.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              {!t.assigned_to && <RowAction disabled={savingId === t.id} onClick={() => assignToMe(t.id)}>Assign to me</RowAction>}
              <select value={t.status} disabled={savingId === t.id} onChange={(e) => changeStatus(t.id, e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-1.5 text-body-sm text-slate-900">
                {['open', 'in_progress', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <RowAction variant="outline" onClick={() => setOpenTicketId(openTicketId === t.id ? null : t.id)}>Reply</RowAction>
            </div>
            {openTicketId === t.id && (
              <div className="mt-3 flex gap-2">
                <textarea rows={2} value={replyDraft[t.id] || ''} onChange={(e) => setReplyDraft((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  placeholder="Type a reply..." className="flex-1 rounded border border-slate-200 bg-white px-3 py-2 text-body-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none" />
                <RowAction disabled={savingId === t.id} onClick={() => sendReply(t.id)}>Send</RowAction>
              </div>
            )}
          </div>
        ))}
        {!visible.length && <p className="py-8 text-center text-body-sm text-slate-600">No tickets in the queue.</p>}
      </div>
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

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchInvoices(accessToken, { limit: 100 }), fetchClients(accessToken, { limit: 100 })]).then(([i, c]) => {
      if (i.status === 'fulfilled') setInvoices(i.value?.data || []);
      if (c.status === 'fulfilled') setClients(c.value?.data || []);
    }).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load();   }, [load]);

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
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
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
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr><th className="px-stack-lg py-4">Invoice</th><th className="px-stack-lg py-4">Client</th><th className="px-stack-lg py-4">Total</th><th className="px-stack-lg py-4">Due</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4 text-body-md text-slate-900">{inv.invoice_number}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{clientName(inv.client_id)}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-900">{inv.currency} {Number(inv.total_amount).toLocaleString()}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{inv.due_date}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={INVOICE_STATUS_COLOR[inv.status]}>{inv.status}</StatusBadge></td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    {inv.status === 'draft' && <RowAction disabled={actingId === inv.id} onClick={() => send(inv.id)}>Send</RowAction>}
                    {(inv.status === 'sent' || inv.status === 'overdue') && <RowAction disabled={actingId === inv.id} onClick={() => markPaid(inv)}>Record Payment</RowAction>}
                  </div>
                </td>
              </tr>
            ))}
            {!invoices.length && <tr><td colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No invoices yet.</td></tr>}
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

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    const params = { limit: 100 };
    if (filter !== 'all') params.status = filter;
    fetchLeaves(accessToken, params).then((r) => setLeaves(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken, filter]);

  useEffect(() => { load(); }, [load]);

  // auto-refresh every 30s so new employee submissions appear
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-slate-900">Filter:</span>
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
                filter === s ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
              }`}>{s}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-slate-900">
          <Icon name="refresh" className="text-base" /> Refresh
        </button>
      </div>
      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('success') || toast.includes('approved') || toast.includes('rejected')
            ? 'border border-green-500/30 bg-green-500/10 text-green-300'
            : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
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
          <tbody className="divide-y divide-slate-200">
            {leaves.map((l) => {
              const days = l.start_date && l.end_date
                ? Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1
                : '—';
              return (
                <tr key={l.id} className="transition-colors hover:bg-blue-50">
                  <td className="px-stack-lg py-4">
                    <p className="text-body-md font-semibold text-slate-900">{l.employee_code || '—'}</p>
                    {l.designation && <p className="text-body-sm text-slate-600">{l.designation}</p>}
                  </td>
                  <td className="px-stack-lg py-4 text-body-md capitalize text-slate-900">{l.type}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-slate-600">{l.start_date}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-slate-600">{l.end_date}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-slate-600">{days}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-slate-600">{l.reason || '—'}</td>
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
            {!leaves.length && <tr><td colSpan={8} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No leave requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Recruitment({ accessToken }) {
  const [positions, setPositions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      apiRequest('/careers?limit=50', { token: accessToken }),
      fetchApplications(accessToken, { limit: 100 }),
    ]).then(([positionsRes, appsRes]) => {
      if (positionsRes.status === 'fulfilled') setPositions(positionsRes.value?.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value?.data || []);
    }).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    try {
      await updateApplicationStatus(accessToken, id, status);
      showToast('Application status updated.');
      load();
    } catch (err) {
      showToast(err?.message || 'Update failed.');
    } finally {
      setSavingId(null);
    }
  };

  const positionTitle = (careerId) => positions.find((p) => p.id === careerId)?.title || 'Position';

  const openPositions = positions.filter((p) => p.status === 'open');
  const inPipeline = applications.filter((a) => ['applied', 'shortlisted', 'interview', 'offered'].includes(a.status)).length;
  const hiredCount = applications.filter((a) => a.status === 'hired').length;
  const filtered = statusFilter === 'all' ? applications : applications.filter((a) => a.status === statusFilter);

  const kpis = [
    { label: 'Open Positions', value: openPositions.length, icon: 'work' },
    { label: 'Applications', value: applications.length, icon: 'person_add' },
    { label: 'In Pipeline', value: inPipeline, icon: 'swap_horiz' },
    { label: 'Hired', value: hiredCount, icon: 'verified' },
  ];

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
        {kpis.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Icon name={stat.icon} className="text-2xl text-brand" />
              <span className="font-label-caps text-label-caps text-slate-600">{stat.label}</span>
            </div>
            <p className="font-stat text-stat-lg text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-headline-sm text-slate-900">Open Positions</h3>
          <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-slate-900">
            <Icon name="refresh" className="text-base" /> Refresh
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {openPositions.map((p) => (
            <div key={p.id} className="rounded-lg border border-slate-200 p-4">
              <p className="mb-1 font-display text-body-lg font-semibold text-slate-900">{p.title}</p>
              <p className="text-body-sm capitalize text-slate-600">
                {p.department || 'General'} · {p.location || 'Remote'} · {String(p.employment_type || 'full_time').replace('_', ' ')}
              </p>
              <p className="mt-1 text-body-sm text-slate-600">{p.experience_required ? `Experience: ${p.experience_required}` : ''}</p>
            </div>
          ))}
          {!openPositions.length && <p className="text-body-sm text-slate-600">No open positions right now.</p>}
        </div>
      </div>

      {toast && (
        <p className={`rounded-lg px-4 py-2 text-body-sm ${
          toast.includes('success') || toast.includes('updated')
            ? 'border border-green-500/30 bg-green-500/10 text-green-300'
            : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>{toast}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps uppercase text-slate-900">Filter:</span>
          {['all', ...APPLICATION_STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
                statusFilter === s ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
              }`}>{s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-label-caps text-label-caps uppercase text-slate-500">
            <tr>
              <th className="px-stack-lg py-4">Applicant</th>
              <th className="px-stack-lg py-4">Position</th>
              <th className="px-stack-lg py-4">Email</th>
              <th className="px-stack-lg py-4">Applied</th>
              <th className="px-stack-lg py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-blue-50">
                <td className="px-stack-lg py-4 text-body-md text-slate-900">{a.full_name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{positionTitle(a.career_id)}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{a.email}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-600">{(a.created_at || '').slice(0, 10) || '—'}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={APPLICATION_STATUS_COLOR[a.status]}>{a.status}</StatusBadge>
                    <select value={a.status} disabled={savingId === a.id} onChange={(e) => changeStatus(a.id, e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-body-sm text-slate-900">
                      {APPLICATION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-slate-600">No applications found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ROLE_LABELS = {
  employee: 'Employee',
  developer: 'Developer',
  sales: 'Sales',
  marketing: 'Marketing',
  project_manager: 'Project Manager',
  qa: 'QA',
  support: 'Support',
  finance: 'Finance',
  hr: 'HR',
};

const PATH_ROLE_MAP = {
  '/employee': 'employee',
  '/sales': 'sales',
  '/marketing': 'marketing',
  '/developer': 'developer',
  '/project-manager': 'project_manager',
  '/qa': 'qa',
  '/support': 'support',
  '/finance': 'finance',
  '/hr': 'hr',
};

const CRM_ROLES = ['sales', 'marketing', 'admin', 'project_manager'];

// ─── Employee data normalizers ───────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const normalizeLeaves = (arr) => (arr || []).map((l) => ({
  id: l.id, type: l.type,
  from: l.start_date ?? l.from, to: l.end_date ?? l.to, status: l.status,
  days: l.start_date && l.end_date ? Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1 : (l.days ?? 1),
}));

const normalizeTimesheets = (arr) => (arr || []).map((t) => ({
  id: t.id, date: t.date,
  project: t.project?.title ?? t.project_name ?? 'General',
  hours: Number(t.hours ?? 0), description: t.description,
}));

const normalizePayslips = (arr) => (arr || []).map((p) => ({
  month: MONTH_NAMES[(p.month ?? 1) - 1], year: p.year,
  grossPay: Number(p.basic ?? 0) + Number(p.allowances ?? 0),
  deductions: Number(p.deductions ?? 0), netPay: Number(p.net_pay ?? 0), status: p.status,
}));

const normalizeTasks = (arr) => (arr || []).map((t) => ({
  id: t.id, title: t.title,
  project: t.project?.title ?? t.project_name ?? '—',
  priority: t.priority, status: t.status, due: t.due_date ?? t.due ?? '—',
}));

const normalizeEmpProjects = (arr) => (arr || []).map((p) => ({
  id: p.id, title: p.title,
  role: p.role ?? 'Member', status: p.status,
  progress: p.progress_percent ?? p.progress ?? 0,
  deadline: p.end_date ?? p.deadline ?? '—',
}));

const normalizePerformance = (arr) => (arr || []).map((r) => ({
  period: r.review_period ?? r.period,
  rating: Number(r.rating ?? 0), goals: r.goals_set ?? r.goals ?? 0,
  achieved: r.goals_achieved ?? r.achieved ?? 0, feedback: r.feedback ?? r.comments ?? '',
}));

const normalizeTraining = (arr) => (arr || []).map((t) => ({
  id: t.id, courseId: t.course_id ?? t.courseId ?? t.training?.id,
  title: t.training?.title ?? t.title,
  category: t.training?.category ?? t.category ?? '—',
  status: t.status, completedOn: t.completed_at?.slice(0, 10) ?? t.completedOn ?? null,
  score: t.score ?? null,
}));

const normalizeCatalog = (arr) => (arr || []).map((c) => ({
  id: c.id, title: c.title, category: c.category || 'General',
  description: c.description, duration_hours: c.duration_hours,
}));

const normalizeDocs = (arr) => (arr || []).map((d) => ({
  id: d.id, name: d.title ?? d.name, type: d.type,
  uploadedOn: d.created_at?.slice(0, 10) ?? d.uploadedOn, file_url: d.file_url,
}));

const toLocalTime = (t) => {
  if (!t) return null;
  const m = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return t;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  const d = new Date();
  d.setUTCHours(h, Number(m[2]), 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function EmployeePortal() {
  const { pathname } = useLocation();
  const urlRole = PATH_ROLE_MAP[pathname] || 'employee';
  const portalTitle = `${ROLE_LABELS[urlRole] || 'Employee'} Portal`;

  useDocumentTitle(`${portalTitle} | CoreFusion Technologies`);
  const { user, initializing, accessToken, logout } = useAuth();
  const { denied } = useRoleGuard('employee', '/login');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const [profile, setProfile] = useState({ name: '', email: '', role: 'employee', designation: '', department: '', status: 'active', employee_code: '' });
  const [attendance, setAttendance] = useState({ date: new Date().toISOString().slice(0, 10), checkIn: null, checkOut: null, status: 'absent' });
  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [training, setTraining] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [proposalsData, setProposalsData] = useState([]);
  const [contractsData, setContractsData] = useState([]);
  // The portal always uses the role the backend authenticated for this session.
  // No client-side role override is possible — tabs and permissions reflect the
  // real role returned by `/employees/me/profile`.
  const effectiveRole = profile.role;
  const portalTabs = employeeTabsForRole(effectiveRole);

  const refreshCrm = useCallback(() => {
    if (!accessToken) return;
    Promise.allSettled([fetchLeads(accessToken), fetchProposals(accessToken), fetchContracts(accessToken)])
      .then(([l, p, c]) => {
        if (l.status === 'fulfilled') setLeadsData(l.value?.data || []);
        if (p.status === 'fulfilled') setProposalsData(p.value?.data || []);
        if (c.status === 'fulfilled') setContractsData(c.value?.data || []);
      });
  }, [accessToken]);

  const handleEnroll = (courseId) => {
    if (!accessToken) return;
    setEnrollingId(courseId);
    enrollInCourse(accessToken, courseId)
      .then(() => fetchMyTrainingEnrollments(accessToken))
      .then((res) => {
        setTraining(normalizeTraining(res?.data));
      })
      .catch(() => {})
      .finally(() => setEnrollingId(null));
  };

  useEffect(() => {
    if (!user || !accessToken) { setLoading(false); return; }
    if (!initialLoadDone.current) setLoading(true);

    Promise.allSettled([
      fetchMyProfile(accessToken),
      fetchMyPayslips(accessToken),
      fetchMyPerformanceReviews(accessToken),
      fetchMyTrainingEnrollments(accessToken),
      fetchMyDocuments(accessToken),
      fetchTrainingCatalog(accessToken),
    ]).then(([profileRes, psRes, perfRes, trainRes, docsRes, catRes]) => {
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value?.data;
        if (p) {
          const realRole = p.role || 'employee';
          setProfile({
            _employeeId: p.id,
            _userId: p.user_id,
            employee_code: p.employee_code,
            name: p.name || user.email,
            email: p.email || user.email,
            role: realRole,
            designation: p.designation,
            department: p.department_name || p.department_id,
            status: p.status,
          });
          Promise.allSettled([
            apiRequest(`/employees/me/attendance/today`, { token: accessToken }),
            apiRequest(`/employees/me/leaves`, { token: accessToken }),
            apiRequest(`/employees/me/timesheets`, { token: accessToken }),
            apiRequest(`/tasks?assigned_to=${p.user_id}&limit=50`, { token: accessToken }),
            apiRequest(`/projects?employee_id=${p.id}&limit=50`, { token: accessToken }),
          ]).then(([attRes, lvRes, tsRes, taskRes, projRes]) => {
            if (attRes.status === 'fulfilled' && attRes.value?.data) {
              const a = attRes.value.data;
              setAttendance({ date: a.date, checkIn: toLocalTime(a.check_in), checkOut: toLocalTime(a.check_out), status: a.status });
            }
            if (lvRes.status === 'fulfilled') setLeaves(normalizeLeaves(lvRes.value?.data));
            if (tsRes.status === 'fulfilled') setTimesheets(normalizeTimesheets(tsRes.value?.data));
            if (taskRes.status === 'fulfilled') setTasks(normalizeTasks(taskRes.value?.data));
            if (projRes.status === 'fulfilled') setProjects(normalizeEmpProjects(projRes.value?.data));
          });
        }
      }
      if (psRes.status === 'fulfilled') setPayslips(normalizePayslips(psRes.value?.data));
      if (perfRes.status === 'fulfilled') setPerformance(normalizePerformance(perfRes.value?.data));
      if (trainRes.status === 'fulfilled') setTraining(normalizeTraining(trainRes.value?.data));
      if (catRes.status === 'fulfilled') setCatalog(normalizeCatalog(catRes.value?.data));
      if (docsRes.status === 'fulfilled') setDocuments(normalizeDocs(docsRes.value?.data));
    }).finally(() => { initialLoadDone.current = true; setLoading(false); });
  }, [user, accessToken]);

  useEffect(() => {
    if (!user || !accessToken || !CRM_ROLES.includes(effectiveRole)) return;
    refreshCrm();
  }, [user, accessToken, effectiveRole, refreshCrm]);

  // Reset to the first tab whenever the (real or previewed) role changes, since the
  // previously active tab may not exist in the new role's tab set.
  useEffect(() => {
    setActiveTab('overview');
  }, [effectiveRole]);

  useEffect(() => {
    if (!initializing && !user) navigate('/login', { replace: true });
  }, [initializing, user, navigate]);

  useEffect(() => {
    if (denied) navigate(profile.role === 'client' ? '/client' : '/login', { replace: true });
  }, [denied, profile.role, navigate]);

  if (initializing || !user || denied) return <div className="bg-white/10 py-section-padding"><LoadingSpinner /></div>;
  if (loading) return <div className="bg-white/10 py-section-padding"><LoadingSpinner /></div>;

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: '#102C4F' }}>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-margin-mobile py-3 md:px-margin-desktop" style={{ backgroundColor: '#0d2240', borderColor: '#1a3a5e' }}>
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size="lg" />
          <div>
            <p className="mb-1 font-label-caps text-body-xs uppercase tracking-widest text-blue-300">{portalTitle}</p>
            <h1 className="font-display text-headline-md font-bold text-slate-900">{profile.name}</h1>
            <p className="text-body-sm text-blue-200">{profile.email} &middot; {profile.designation} &middot; {profile.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r md:block" style={{ backgroundColor: '#0d2240', borderColor: '#1a3a5e' }}>
          <nav className="flex flex-col gap-1 p-3">
            {portalTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-colors ${
                  activeTab === tab.id ? 'bg-white/20 font-bold text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-stack-lg flex flex-wrap gap-1 overflow-x-auto border-b px-margin-mobile py-2 md:hidden" style={{ backgroundColor: '#0d2240', borderColor: '#1a3a5e' }}>
            {portalTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
                  activeTab === tab.id ? 'border-white font-bold text-white' : 'border-transparent text-blue-200 hover:border-blue-400 hover:text-white'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto px-margin-mobile py-stack-lg md:px-margin-desktop">
            {activeTab === 'overview' && <Overview profile={profile} attendance={attendance} leaves={leaves} timesheets={timesheets} payslips={payslips} />}
            {activeTab === 'leads' && effectiveRole === 'sales' && <Leads leads={leadsData} accessToken={accessToken} onRefresh={refreshCrm} />}
            {activeTab === 'proposals' && effectiveRole === 'sales' && <Proposals proposals={proposalsData} leads={leadsData} accessToken={accessToken} onRefresh={refreshCrm} />}
            {activeTab === 'contracts' && effectiveRole === 'sales' && <Contracts contracts={contractsData} proposals={proposalsData} leads={leadsData} accessToken={accessToken} onRefresh={refreshCrm} />}
            {activeTab === 'marketing-leads' && effectiveRole === 'marketing' && <MarketingLeadsView accessToken={accessToken} />}
            {activeTab === 'testimonials' && effectiveRole === 'marketing' && <TestimonialModeration accessToken={accessToken} />}
            {activeTab === 'team-projects' && effectiveRole === 'project_manager' && <TeamProjects accessToken={accessToken} userId={user?.id} />}
            {activeTab === 'task-board' && effectiveRole === 'project_manager' && <TaskBoard accessToken={accessToken} userId={user?.id} />}
            {activeTab === 'approvals' && effectiveRole === 'project_manager' && <Approvals accessToken={accessToken} />}
            {activeTab === 'test-queue' && effectiveRole === 'qa' && <TestQueue accessToken={accessToken} />}
            {activeTab === 'ticket-queue' && effectiveRole === 'support' && <TicketQueue accessToken={accessToken} userId={user?.id} />}
            {activeTab === 'invoices' && effectiveRole === 'finance' && <Invoices accessToken={accessToken} />}
            {activeTab === 'leave-approvals' && effectiveRole === 'hr' && <LeaveApprovals accessToken={accessToken} />}
            {activeTab === 'recruitment' && effectiveRole === 'hr' && <Recruitment accessToken={accessToken} />}
            {activeTab === 'attendance' && <Attendance attendance={attendance} accessToken={accessToken} onChange={setAttendance} />}
            {activeTab === 'leaves' && <Leaves leaves={leaves} accessToken={accessToken} />}
            {activeTab === 'timesheets' && <Timesheets timesheets={timesheets} accessToken={accessToken} />}
            {activeTab === 'payslips' && <Payslips payslips={payslips} />}
            {activeTab === 'tasks' && <Tasks tasks={tasks} />}
            {activeTab === 'projects' && <Projects projects={projects} />}
            {activeTab === 'performance' && <Performance reviews={performance} />}
            {activeTab === 'training' && <Training courses={training} catalog={catalog} onEnroll={handleEnroll} enrollingId={enrollingId} />}
            {activeTab === 'documents' && <Documents docs={documents} />}
          </div>
        </div>
      </div>
    </div>
  );
}
