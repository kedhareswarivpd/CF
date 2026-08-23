import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { adminPanelTabs } from '../data/portal.js';
import { PORTAL_ROLE_OPTIONS } from '../data/roles.js';
import {
  fetchUsers, createUser, updateUser, deactivateUser,
  fetchAdminProjects, createProject, updateProject, deleteProject,
  fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
  fetchMedia, deleteMedia, uploadMedia,
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
  fetchReports, generateReport, deleteReport,
  fetchAuditLogs,
  fetchEmployees, fetchClients,
  fetchDashboardOverview, fetchProjectStatusBreakdown as fetchProjectStatusBreakdownApi,
  fetchContactSubmissions, updateContactStatus,
  fetchAnalyticsSummary,
  fetchSettings, upsertSetting, deleteSetting,
  createNotification,
  fetchComments, moderateComment, deleteComment,
  fetchNewsletterSubscribers,
  fetchCourses, createCourse,
  fetchApplications, updateApplicationStatus,
} from '../api/admin.js';
import { careersApi } from '../api/cms.js';
import { createLead } from '../api/crm.js';

import { useRoleGuard } from '../hooks/useRoleGuard.js';
import ContentManager from '../components/admin/ContentManager.jsx';
import { FORM_INPUT_CLASS } from '../components/ui/formClasses.js';

// ── Toast notification system ────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex animate-fade-in items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium shadow-lg
            ${t.type === 'success' ? 'bg-status-success-bg text-status-success-text' : 'bg-status-error-bg text-status-error-text'}`}
        >
          <Icon name={t.type === 'success' ? 'check_circle' : 'error'} className="flex-shrink-0 text-lg" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  return { toasts, toast: add };
}

// ── Convert-to-Lead modal ────────────────────────────────────────────────────
function ConvertToLeadModal({ submission, accessToken, onClose, onSuccess }) {
  const [estimatedValue, setEstimatedValue] = useState('');
  const [notes, setNotes] = useState(submission.message || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createLead(accessToken, {
        contact_name: submission.name,
        email: submission.email,
        phone: submission.phone || null,
        company: submission.company || null,
        source: 'contact_form',
        contact_submission_id: submission.id,
        estimated_value: estimatedValue ? Number(estimatedValue) : null,
        notes: notes || null,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Could not convert to lead.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-white p-6 shadow-2xl dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-headline-sm font-bold text-brand-dark dark:text-dark-brand">Convert to Lead</h2>
            <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">Create a CRM lead from this contact submission</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink dark:text-dark-ink-muted"><Icon name="close" className="text-xl" /></button>
        </div>

        {/* Pre-filled read-only summary */}
        <div className="mb-5 space-y-1 rounded-lg bg-surface-container p-4 dark:bg-dark-surface-container">
          <p className="text-body-sm font-semibold text-brand-dark dark:text-dark-brand">{submission.name}</p>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.email}</p>
          {submission.phone && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.phone}</p>}
          {submission.company && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.company}</p>}
        </div>

        <form onSubmit={handleConvert} className="space-y-4">
          <div>
            <label className="mb-1 block text-body-sm font-medium text-ink dark:text-dark-ink">Estimated Value (USD)</label>
            <input
              type="number" min="0" step="0.01" placeholder="e.g. 5000"
              value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)}
              className={FORM_INPUT_CLASS + ' w-full'}
            />
          </div>
          <div>
            <label className="mb-1 block text-body-sm font-medium text-ink dark:text-dark-ink">Notes</label>
            <textarea
              rows={3} placeholder="Internal notes about this lead..."
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className={FORM_INPUT_CLASS + ' w-full resize-none'}
            />
          </div>
          {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="submit" variant="primary" size="md" disabled={submitting} className="flex-1">
              {submitting ? 'Converting...' : 'Convert to Lead'}
            </Button>
            <Button type="button" variant="outline" size="md" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ kpis: propKpis, statusBreakdown: propBreakdown, accessToken, setActiveTab }) {
  const kpis = propKpis || { total_employees: 0, total_clients: 0, total_projects: 0, active_projects: 0, open_tasks: 0, total_revenue: 0, open_tickets: 0, new_applications: 0, unresolved_contacts: 0, published_blogs: 0 };
  const statusBreakdown = propBreakdown || [];
  const [recentLogs, setRecentLogs] = useState([]);
  useEffect(() => {
    if (!accessToken) return;
    fetchAuditLogs(accessToken, { limit: 5 }).then((res) => setRecentLogs(res?.data || res || [])).catch(() => {});
  }, [accessToken]);

  const statCards = [
    { label: 'Employees', value: kpis.total_employees, icon: 'badge', color: 'text-status-info-text' },
    { label: 'Clients', value: kpis.total_clients, icon: 'business', color: 'text-status-success-text' },
    { label: 'Projects', value: kpis.total_projects, icon: 'folder', color: 'text-brand' },
    { label: 'Revenue', value: `$${(kpis.total_revenue / 1000000).toFixed(1)}M`, icon: 'payments', color: 'text-status-warning-text' },
    { label: 'Active Projects', value: kpis.active_projects, icon: 'rocket_launch', color: 'text-brand' },
    { label: 'Open Tasks', value: kpis.open_tasks, icon: 'assignment', color: 'text-warning' },
    { label: 'Open Tickets', value: kpis.open_tickets, icon: 'support', color: 'text-status-error-text' },
    { label: 'New Applications', value: kpis.new_applications, icon: 'person_add', color: 'text-brand' },
  ];

  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="flex flex-col rounded-xl border border-blue-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant dark:bg-dark-surface">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Icon name={s.icon} className={`text-2xl ${s.color}`} />
            </div>
            <p className="font-stat text-3xl font-bold text-brand-dark dark:text-dark-brand">{s.value}</p>
            <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
          <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Project Status Breakdown</h3>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex justify-between text-body-sm">
                  <span className="capitalize text-brand-dark dark:text-dark-brand">{item.status.replace('_', ' ')}</span>
                  <span className="text-ink-muted dark:text-dark-ink-muted">{item.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className={`h-full rounded-full transition-all ${
                    item.status === 'completed' ? 'bg-status-success-text' :
                    item.status === 'in_progress' ? 'bg-status-info-text' :
                    item.status === 'on_hold' ? 'bg-status-warning-text' : 'bg-status-neutral-bg'
                  }`} style={{ width: `${(item.count / kpis.total_projects) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
          <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: 'add_circle', label: 'Create User', desc: 'Add a new employee, client, or partner account', tab: 'users' },
              { icon: 'post_add', label: 'New Blog Post', desc: 'Draft and publish a blog article', tab: 'content' },
              { icon: 'upload_file', label: 'Upload Resource', desc: 'Add a whitepaper or downloadable asset', tab: 'media' },
              { icon: 'campaign', label: 'Send Notification', desc: 'Broadcast a message to all users', tab: 'notifications' },
            ].map((action) => (
              <div key={action.label} onClick={() => setActiveTab(action.tab)} className="flex cursor-pointer items-center gap-4 rounded-lg bg-surface-container p-3 transition-colors hover:bg-blue-50 dark:bg-dark-surface-container dark:hover:bg-blue-900/30">
                <Icon name={action.icon} className="text-2xl text-brand" />
                <div>
                  <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{action.label}</p>
                  <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
        <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Recent Activity</h3>
        {recentLogs.length === 0 ? (
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <div key={log.id || i} className="flex items-start gap-3">
                <Icon name="circle" className="mt-1 shrink-0 text-xs text-brand" />
                <div>
                  <p className="text-body-sm text-brand-dark dark:text-dark-brand">{log.action || log.event || 'Activity'}</p>
                  <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">{log.details || log.description || ''}{log.created_at ? ` · ${new Date(log.created_at).toLocaleString()}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentManagement({ accessToken }) {
  return <ContentManager accessToken={accessToken} />;
}

function AddUserForm({ accessToken, currentRole, onCreated, onCancel }) {
  // Admin Portal is only offered to a Super Admin — matches the backend guard in
  // routers/users.py::create_user (only super_admin may mint admin/super_admin).
  const availablePortals = PORTAL_ROLE_OPTIONS.filter((p) => p.value !== 'admin' || currentRole === 'super_admin');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', portal: '', role: '' });
  const [roleError, setRoleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const selectedPortal = availablePortals.find((p) => p.value === form.portal);

  const handlePortalChange = (e) => {
    const portal = e.target.value;
    // Switching portals clears any previously selected role so a stale value
    // from the other portal's role list can never be carried into the payload.
    setForm((prev) => ({ ...prev, portal, role: '' }));
    setRoleError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.portal || !form.role) {
      setRoleError('Please select a role.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      await createUser(accessToken, { name: form.name, email: form.email, password: form.password, phone: form.phone || null, role: form.role });
      onCreated();
    } catch (err) {
      setSubmitError(err.message || 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        <input required type="password" minLength={8} placeholder="Temporary password (min. 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-label-caps text-label-caps uppercase text-ink-muted">Portal</span>
        <select required value={form.portal} onChange={handlePortalChange} className={inputClass}>
          <option value="" disabled>Select a portal</option>
          {availablePortals.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </label>

      {selectedPortal && (
        <label className="flex flex-col gap-1.5">
          <span className="font-label-caps text-label-caps uppercase text-ink-muted">{selectedPortal.roleLabel}</span>
          <select value={form.role} onChange={(e) => { setForm({ ...form, role: e.target.value }); setRoleError(''); }} className={inputClass}>
            <option value="" disabled>Select a role</option>
            {selectedPortal.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {roleError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{roleError}</p>}
        </label>
      )}

      {submitError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{submitError}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Account'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function UserManagement({ accessToken, currentRole }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = useCallback(() => {
    if (!accessToken) { setLoadingUsers(false); return; }
    setLoadingUsers(true);
    fetchUsers(accessToken).then((res) => setUsers(res?.data || [])).catch(() => {}).finally(() => setLoadingUsers(false));
  }, [accessToken]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowAddForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmittingUser(true);
    try {
      await updateUser(accessToken, editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone || null,
        role: editingUser.role,
        is_active: editingUser.is_active,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setUserError(err.message || 'Could not update user.');
    } finally {
      setSubmittingUser(false);
    }
  };

  const [submittingUser, setSubmittingUser] = useState(false);
  const [userError, setUserError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  return (
    <div className="space-y-stack-lg">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">All Users</h3>
          <Button variant="primary" size="md" icon={<Icon name="person_add" />} onClick={() => { setShowAddForm((v) => !v); setEditingUser(null); }}>
            {showAddForm ? 'Close' : 'Add User'}
          </Button>
        </div>
        {(showAddForm || editingUser) && (
          <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
            {editingUser ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required type="text" placeholder="Full name" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className={FORM_INPUT_CLASS} />
                  <input required type="email" placeholder="Email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className={FORM_INPUT_CLASS} />
                  <input type="text" placeholder="Phone (optional)" value={editingUser.phone || ''} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} className={FORM_INPUT_CLASS} />
                  <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className={FORM_INPUT_CLASS}>
                    {PORTAL_ROLE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
                  <input type="checkbox" checked={editingUser.is_active} onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })} />
                  Active
                </label>
                {userError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{userError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" size="md" disabled={submittingUser}>{submittingUser ? 'Updating...' : 'Update User'}</Button>
                  <Button type="button" variant="outline" size="md" onClick={() => { setEditingUser(null); setUserError(''); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <AddUserForm
                accessToken={accessToken}
                currentRole={currentRole}
                onCreated={() => { setShowAddForm(false); loadUsers(); setSuccessMsg('User created successfully!'); setTimeout(() => setSuccessMsg(''), 3000); }}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>
        )}
        {successMsg && (
          <div className="mx-stack-lg mt-4 flex items-center gap-2 rounded-lg bg-status-success-bg p-stack-md text-body-sm text-status-success-text dark:bg-status-success-bg/20">
            <Icon name="check_circle" className="text-lg" />{successMsg}
          </div>
        )}
        {loadingUsers ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
              <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Role</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{u.name}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{u.email}</td>
                  <td className="px-stack-lg py-4 text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">{u.role?.replace('_', ' ')}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'active' : 'inactive'}</StatusBadge></td>
                  <td className="px-stack-lg py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(u)} aria-label={`Edit ${u.name}`} className="text-ink-muted transition-colors hover:text-brand" title="Edit">
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button onClick={() => { if (window.confirm(`Deactivate user "${u.name}"?`)) { deactivateUser(accessToken, u.id).then(loadUsers); }}} aria-label={`Deactivate ${u.name}`} className="text-ink-muted transition-colors hover:text-status-warning-text" title="Deactivate">
                        <Icon name="block" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No users found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">User Roles</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
            <tr><th className="px-stack-lg py-4">Role</th><th className="px-stack-lg py-4">Users</th><th className="px-stack-lg py-4">Permissions</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {(() => {
              const roleCounts = {};
              users.forEach((u) => {
                const r = u.role || 'unknown';
                roleCounts[r] = (roleCounts[r] || 0) + 1;
              });
              const roleList = Object.keys(roleCounts).sort((a, b) => roleCounts[b] - roleCounts[a]);
              if (!roleList.length) {
                return <tr><td colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No roles found.</td></tr>;
              }
              return roleList.map((role) => (
                <tr key={role} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <td className="px-stack-lg py-4 text-body-md capitalize text-brand-dark dark:text-dark-brand">{role.replace('_', ' ')}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{roleCounts[role]}</td>
                  <td className="px-stack-lg py-4 text-body-md capitalize text-ink-muted dark:text-dark-ink-muted">{role === 'super_admin' ? 'Full access' : role.replace('_', ' ') + ' portal access'}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeManagement({ accessToken }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchEmployees(accessToken, { limit: 100 })
      .then((res) => setEmployees(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Employees ({employees.length})</h3>
      </div>
      {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
        <table className="w-full text-left">
          <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
            <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Code</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Designation</th><th className="px-stack-lg py-4">Department</th><th className="px-stack-lg py-4">Employment</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {employees.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                <td className="px-stack-lg py-4 text-body-md font-semibold text-brand-dark dark:text-dark-brand">{e.name || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{e.employee_code || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{e.email || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{e.designation || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{e.department_name || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">{(e.employment_type || '—').replace('_', ' ')}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={e.status === 'active' ? 'success' : 'neutral'}>{e.status}</StatusBadge></td>
              </tr>
            ))}
            {!employees.length && <tr><td colSpan={7} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No employees found.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ClientManagement({ accessToken }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchClients(accessToken, { limit: 100 })
      .then((res) => setClients(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Clients</h3>
      </div>
      {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
        <table className="w-full text-left">
          <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
            <tr><th className="px-stack-lg py-4">Company</th><th className="px-stack-lg py-4">Industry</th><th className="px-stack-lg py-4">Country</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {clients.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{c.company_name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.industry || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.country || '—'}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={c.status === 'active' ? 'success' : 'neutral'}>{c.status || 'active'}</StatusBadge></td>
              </tr>
            ))}
            {!clients.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No clients found.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

const PROJECT_STATUS_OPTIONS = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
const PROJECT_STATUS_VARIANT = {
  planning: 'neutral', in_progress: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error',
};

function AddProjectForm({ accessToken, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', industry: '', status: 'planning', budget: '', is_published: false, is_featured: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createProject(accessToken, {
        title: form.title,
        industry: form.industry || null,
        status: form.status,
        budget: form.budget ? Number(form.budget) : null,
        is_published: form.is_published,
        is_featured: form.is_featured,
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create the project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required type="text" placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Industry (optional)" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputClass} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
          {PROJECT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <input type="number" min="0" placeholder="Budget (optional)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputClass} />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />Published
        </label>
        <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />Featured
        </label>
      </div>
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function ProjectsManagement({ accessToken }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const loadProjects = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAdminProjects(accessToken, { limit: 50 }).then((res) => setProjects(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowAddForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setSubmittingProject(true);
    try {
      await updateProject(accessToken, editingProject.id, {
        title: editingProject.title,
        industry: editingProject.industry || null,
        status: editingProject.status,
        budget: editingProject.budget ? Number(editingProject.budget) : null,
        is_published: editingProject.is_published,
        is_featured: editingProject.is_featured,
        progress_percent: editingProject.progress_percent,
      });
      setEditingProject(null);
      loadProjects();
    } catch (err) {
      setProjectError(err.message || 'Could not update project.');
    } finally {
      setSubmittingProject(false);
    }
  };

  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectError, setProjectError] = useState('');

  const togglePublish = async (project) => {
    try {
      await updateProject(accessToken, project.id, { is_published: !project.is_published });
      loadProjects();
    } catch { /* surfaced via the row staying unchanged */ }
  };

  const remove = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"?`)) return;
    try {
      await deleteProject(accessToken, project.id);
      loadProjects();
    } catch { /* surfaced via the row staying in the list */ }
  };

  return (
    <div className="space-y-stack-lg">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">All Projects</h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => { setShowAddForm((v) => !v); setEditingProject(null); }}>
            {showAddForm ? 'Close' : 'New Project'}
          </Button>
        </div>
        {(showAddForm || editingProject) && (
          <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
            {editingProject ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required type="text" placeholder="Project title" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} className={FORM_INPUT_CLASS} />
                  <input type="text" placeholder="Industry (optional)" value={editingProject.industry || ''} onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })} className={FORM_INPUT_CLASS} />
                  <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })} className={FORM_INPUT_CLASS}>
                    {PROJECT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <input type="number" min="0" max="100" placeholder="Progress %" value={editingProject.progress_percent ?? 0} onChange={(e) => setEditingProject({ ...editingProject, progress_percent: Number(e.target.value) })} className={FORM_INPUT_CLASS} />
                  <input type="number" min="0" placeholder="Budget (optional)" value={editingProject.budget || ''} onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })} className={FORM_INPUT_CLASS} />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
                    <input type="checkbox" checked={editingProject.is_published} onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked })} />Published
                  </label>
                  <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
                    <input type="checkbox" checked={editingProject.is_featured} onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })} />Featured
                  </label>
                </div>
                {projectError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{projectError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" size="md" disabled={submittingProject}>{submittingProject ? 'Updating...' : 'Update Project'}</Button>
                  <Button type="button" variant="outline" size="md" onClick={() => { setEditingProject(null); setProjectError(''); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <AddProjectForm accessToken={accessToken} onCreated={() => { setShowAddForm(false); loadProjects(); }} onCancel={() => setShowAddForm(false)} />
            )}
          </div>
        )}
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
              <tr>
                <th className="px-stack-lg py-4">Title</th>
                <th className="px-stack-lg py-4">Industry</th>
                <th className="px-stack-lg py-4">Status</th>
                <th className="px-stack-lg py-4">Progress</th>
                <th className="px-stack-lg py-4">Published</th>
                <th className="px-stack-lg py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {projects.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{p.title}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.industry || '—'}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={PROJECT_STATUS_VARIANT[p.status] || 'neutral'}>{p.status?.replace('_', ' ')}</StatusBadge></td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.progress_percent ?? 0}%</td>
                  <td className="px-stack-lg py-4">
                    <button onClick={() => togglePublish(p)} className="cursor-pointer">
                      <StatusBadge variant={p.is_published ? 'success' : 'neutral'}>{p.is_published ? 'published' : 'draft'}</StatusBadge>
                    </button>
                  </td>
                  <td className="px-stack-lg py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} aria-label={`Edit ${p.title}`} className="text-ink-muted transition-colors hover:text-brand" title="Edit">
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button onClick={() => remove(p)} aria-label={`Delete ${p.title}`} className="text-ink-muted transition-colors hover:text-status-error-text" title="Delete">
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!projects.length && (
                <tr><td colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AddRoleForm({ accessToken, onCreated, onCancel }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createRole(accessToken, form);
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create the role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required type="text" placeholder="Role name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Slug (e.g. content-editor)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Role'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function AddPermissionForm({ accessToken, onCreated, onCancel }) {
  const [form, setForm] = useState({ name: '', module: '', action: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createPermission(accessToken, form);
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create the permission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <input required type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Module (e.g. projects)" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Action (e.g. delete)" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className={inputClass} />
      </div>
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Permission'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function RolesManagement({ accessToken }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleForm, setShowRoleForm] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchRoles(accessToken, { limit: 50 })
      .then((r) => setRoles(r?.data || []))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const removeRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try { await deleteRole(accessToken, role.id); load(); } catch { /* row stays visible on failure */ }
  };

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Custom Roles</h3>
        <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowRoleForm((v) => !v)}>
          {showRoleForm ? 'Close' : 'New Role'}
        </Button>
      </div>
      {showRoleForm && (
        <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
          <AddRoleForm accessToken={accessToken} onCreated={() => { setShowRoleForm(false); load(); }} onCancel={() => setShowRoleForm(false)} />
        </div>
      )}
      <table className="w-full text-left">
        <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
          <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Slug</th><th className="px-stack-lg py-4">Description</th><th className="px-stack-lg py-4"></th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {roles.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{r.name}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.slug}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.description || '—'}</td>
              <td className="px-stack-lg py-4 text-right">
                {!r.is_system && (
                  <button onClick={() => removeRole(r)} aria-label={`Delete role ${r.name}`} className="text-ink-muted transition-colors hover:text-status-error-text">
                    <Icon name="delete" className="text-lg" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!roles.length && (
            <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No custom roles yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PermissionsManagement({ accessToken }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPermForm, setShowPermForm] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchPermissions(accessToken, { limit: 100 })
      .then((p) => setPermissions(p?.data || []))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const removePermission = async (perm) => {
    if (!window.confirm(`Delete permission "${perm.name}"?`)) return;
    try { await deletePermission(accessToken, perm.id); load(); } catch { /* row stays visible on failure */ }
  };

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Permissions</h3>
        <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowPermForm((v) => !v)}>
          {showPermForm ? 'Close' : 'New Permission'}
        </Button>
      </div>
      {showPermForm && (
        <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
          <AddPermissionForm accessToken={accessToken} onCreated={() => { setShowPermForm(false); load(); }} onCancel={() => setShowPermForm(false)} />
        </div>
      )}
      <table className="w-full text-left">
        <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
          <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Module</th><th className="px-stack-lg py-4">Action</th><th className="px-stack-lg py-4"></th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {permissions.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{p.name}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.module}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.action}</td>
              <td className="px-stack-lg py-4 text-right">
                <button onClick={() => removePermission(p)} aria-label={`Delete permission ${p.name}`} className="text-ink-muted transition-colors hover:text-status-error-text">
                  <Icon name="delete" className="text-lg" />
                </button>
              </td>
            </tr>
          ))}
          {!permissions.length && (
            <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No permissions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function mediaIcon(mimeType) {
  if (!mimeType) return 'insert_drive_file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'movie';
  if (mimeType === 'application/pdf') return 'picture_as_pdf';
  return 'insert_drive_file';
}

function MediaManagement({ accessToken }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadMedia = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchMedia(accessToken, { limit: 60 }).then((res) => setMedia(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      await uploadMedia(accessToken, files, 'misc');
      loadMedia();
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.file_name}"?`)) return;
    try { await deleteMedia(accessToken, item.id); loadMedia(); } catch { /* item stays visible on failure */ }
  };

  return (
    <div className="space-y-stack-lg">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Media Library</h3>
          <label className="flex cursor-pointer items-center gap-2 rounded bg-brand px-4 py-2.5 font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark">
            <Icon name="upload_file" className="text-lg" />
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        {error && <p className="flex items-center gap-1 px-stack-lg pt-4 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <div className="grid grid-cols-2 gap-gutter p-stack-lg sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <div key={m.id} className="group relative overflow-hidden rounded-lg border border-outline-variant dark:border-dark-outline-variant">
                {m.mime_type?.startsWith('image/') ? (
                  <img src={m.url} alt={m.file_name} className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-surface-container dark:bg-dark-surface-container">
                    <Icon name={mediaIcon(m.mime_type)} className="text-4xl text-ink-muted" />
                  </div>
                )}
                <div className="p-2">
                  <p className="truncate text-body-sm text-brand-dark dark:text-dark-brand" title={m.file_name}>{m.file_name}</p>
                  <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{m.folder}</p>
                </div>
                <button onClick={() => remove(m)} aria-label={`Delete ${m.file_name}`} className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-ink-muted opacity-0 transition-opacity hover:text-status-error-text group-hover:opacity-100 dark:bg-dark-surface/90">
                  <Icon name="delete" className="text-base" />
                </button>
              </div>
            ))}
            {!media.length && (
              <p className="col-span-full py-8 text-center text-body-sm text-ink-muted">No media uploaded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const NOTIFICATION_ICON = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };
const NOTIFICATION_TEXT = { info: 'text-status-info-text', success: 'text-status-success-text', warning: 'text-status-warning-text', error: 'text-status-error-text' };

function SendNotificationForm({ accessToken, onSent, onCancel }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', link: '', roles: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true);
    try {
      const roles = form.roles.split(',').map((r) => r.trim()).filter(Boolean);
      await createNotification(accessToken, {
        title: form.title, message: form.message || undefined, type: form.type,
        link: form.link || undefined, roles: roles.length ? roles : undefined,
      });
      onSent();
    } catch (err) {
      setError(err.message || 'Could not send the notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
          {['info', 'success', 'warning', 'error'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <textarea placeholder="Message (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input type="text" placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Roles (comma-separated, e.g. admin,hr — blank = everyone)" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} className={inputClass} />
      </div>
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Sending...' : 'Send Notification'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function NotificationsManagement({ accessToken }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchNotifications(accessToken).then((res) => setNotifications(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const markOne = async (n) => {
    try { await markNotificationRead(accessToken, n.id); load(); } catch { /* row stays unread on failure */ }
  };

  const markAll = async () => {
    try { await markAllNotificationsRead(accessToken); load(); } catch { /* list stays unchanged on failure */ }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-stack-lg">
      <div className="flex justify-end">
        <Button onClick={() => setShowSend((v) => !v)} variant="primary" size="md" icon={<Icon name="send" />}>Send Notification</Button>
      </div>
      {showSend && <SendNotificationForm accessToken={accessToken} onSent={() => { setShowSend(false); load(); }} onCancel={() => setShowSend(false)} />}
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">
            Notifications {unreadCount > 0 && <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">({unreadCount} unread)</span>}
          </h3>
          <Button variant="outline" size="md" icon={<Icon name="done_all" />} onClick={markAll} disabled={!unreadCount}>
            Mark All Read
          </Button>
        </div>
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-4 p-stack-lg ${n.is_read ? '' : 'bg-surface-container dark:bg-dark-surface-container'}`}>
                <Icon name={NOTIFICATION_ICON[n.type] || 'info'} className={`mt-0.5 text-2xl ${NOTIFICATION_TEXT[n.type] || 'text-status-info-text'}`} />
                <div className="flex-1">
                  <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{n.title}</p>
                  {n.message && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{n.message}</p>}
                  <p className="mt-1 font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markOne(n)} aria-label="Mark as read" className="text-ink-muted transition-colors hover:text-brand" title="Mark as read">
                    <Icon name="check" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
            {!notifications.length && (
              <p className="py-8 text-center text-body-sm text-ink-muted">No notifications.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GenerateReportForm({ accessToken, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', report_type: '', period: '', summary: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await generateReport(accessToken, form);
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not generate the report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Type (e.g. financial)" value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Period (e.g. Q1 2026)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Summary (optional)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Generating...' : 'Generate Report'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function ReportsManagement({ accessToken }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchReports(accessToken, { limit: 50 }).then((res) => setReports(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (report) => {
    if (!window.confirm(`Delete report "${report.title}"?`)) return;
    try { await deleteReport(accessToken, report.id); load(); } catch { /* row stays visible on failure */ }
  };

  return (
    <div className="space-y-stack-lg">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Reports</h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close' : 'Generate Report'}
          </Button>
        </div>
        {showForm && (
          <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
            <GenerateReportForm accessToken={accessToken} onCreated={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
          </div>
        )}
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
              <tr><th className="px-stack-lg py-4">Title</th><th className="px-stack-lg py-4">Type</th><th className="px-stack-lg py-4">Period</th><th className="px-stack-lg py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {reports.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{r.title}</td>
                  <td className="px-stack-lg py-4 text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">{r.report_type}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.period}</td>
                  <td className="flex items-center justify-end gap-3 px-stack-lg py-4 text-right">
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noreferrer" aria-label={`Download ${r.title}`} className="text-ink-muted transition-colors hover:text-brand">
                        <Icon name="download" className="text-lg" />
                      </a>
                    )}
                    <button onClick={() => remove(r)} aria-label={`Delete ${r.title}`} className="text-ink-muted transition-colors hover:text-status-error-text">
                      <Icon name="delete" className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {!reports.length && (
                <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No reports generated yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Contact Submissions ─────────────────────────────────────────────────────

const CONTACT_STATUS_OPTIONS = [
  { value: 'new', label: 'New', variant: 'info' },
  { value: 'in_progress', label: 'In Progress', variant: 'warning' },
  { value: 'resolved', label: 'Resolved', variant: 'success' },
  { value: 'spam', label: 'Spam', variant: 'error' },
];

function ContactsManagement({ accessToken }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [convertTarget, setConvertTarget] = useState(null);
  const { toasts, toast } = useToast();

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    const start = Date.now();
    const params = { limit: 100 };
    if (statusFilter !== 'all') params.status = statusFilter;
    fetchContactSubmissions(accessToken, params)
      .then((res) => setSubmissions(res?.data || []))
      .catch(() => setSubmissions([]))
      .finally(() => {
        const elapsed = Date.now() - start;
        const remaining = 500 - elapsed;
        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      });
  }, [accessToken, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsResolved = async (submission) => {
    try {
      await updateContactStatus(accessToken, submission.id, 'resolved');
      toast('Marked as resolved');
      load();
    } catch { toast('Failed to update status', 'error'); }
  };

  const markAsInProgress = async (submission) => {
    try {
      await updateContactStatus(accessToken, submission.id, 'in_progress');
      toast('Marked as in progress');
      load();
    } catch { toast('Failed to update status', 'error'); }
  };

  const markAsSpam = async (submission) => {
    try {
      await updateContactStatus(accessToken, submission.id, 'spam');
      toast('Marked as spam');
      load();
    } catch { toast('Failed to update status', 'error'); }
  };

  const handleLeadConverted = async (submission) => {
    setConvertTarget(null);
    toast(`${submission.name} converted to lead successfully!`);
    // Also mark as in_progress so the contact shows follow-up is happening
    try { await updateContactStatus(accessToken, submission.id, 'in_progress'); } catch { /* non-critical */ }
    load();
  };

  const newCount = submissions.filter((s) => s.status === 'new').length;

  return (
    <div className="space-y-stack-lg">
      <Toast toasts={toasts} />
      {convertTarget && (
        <ConvertToLeadModal
          submission={convertTarget}
          accessToken={accessToken}
          onClose={() => setConvertTarget(null)}
          onSuccess={() => handleLeadConverted(convertTarget)}
        />
      )}
      <div className="rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <div className="flex items-center gap-4">
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Contact Submissions</h3>
            {newCount > 0 && (
              <span className="rounded-full bg-status-info-text/10 px-2.5 py-0.5 text-xs font-medium text-status-info-text">
                {newCount} new
              </span>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-outline-variant bg-white px-3 py-1.5 text-body-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="spam">Spam</option>
          </select>
        </div>

        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
                <tr>
                  <th className="px-stack-lg py-4">Name</th>
                  <th className="px-stack-lg py-4">Email</th>
                  <th className="px-stack-lg py-4">Phone</th>
                  <th className="px-stack-lg py-4">Company</th>
                  <th className="px-stack-lg py-4">Department</th>
                  <th className="px-stack-lg py-4">Subject</th>
                  <th className="px-stack-lg py-4">Message</th>
                  <th className="px-stack-lg py-4">Status</th>
                  <th className="px-stack-lg py-4">Submitted</th>
                  <th className="px-stack-lg py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                {submissions.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    <td className="px-stack-lg py-4 text-body-md font-semibold text-brand-dark dark:text-dark-brand">{s.name}</td>
                    <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.email}</td>
                    <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.phone || '—'}</td>
                    <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.company || '—'}</td>
                    <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.department?.replace('_', ' ') || '—'}</td>
                    <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.subject || '—'}</td>
                    <td className="max-w-xs truncate px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.message}</td>
                    <td className="px-stack-lg py-4">
                      <StatusBadge variant={CONTACT_STATUS_OPTIONS.find((o) => o.value === s.status)?.variant || 'neutral'}>
                        {s.status?.replace('_', ' ') || 'new'}
                      </StatusBadge>
                    </td>
                    <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-stack-lg py-4">
                      <div className="flex items-center gap-1">
                        {/* Convert to Lead */}
                        {s.status !== 'spam' && (
                          <button
                            onClick={() => setConvertTarget(s)}
                            aria-label="Convert to Lead"
                            className="rounded p-1 text-ink-muted transition-colors hover:bg-blue-50 hover:text-brand dark:text-dark-ink-muted dark:hover:bg-blue-900/30"
                            title="Convert to Lead"
                          >
                            <Icon name="person_add" />
                          </button>
                        )}
                        {/* Mark in progress */}
                        {s.status !== 'in_progress' && s.status !== 'resolved' && (
                          <button
                            onClick={() => markAsInProgress(s)}
                            aria-label="Mark in progress"
                            className="rounded p-1 text-ink-muted transition-colors hover:bg-surface-container hover:text-status-info-text dark:text-dark-ink-muted"
                            title="Mark in progress"
                          >
                            <Icon name="schedule" />
                          </button>
                        )}
                        {/* Mark resolved */}
                        {s.status !== 'resolved' && s.status !== 'spam' && (
                          <button
                            onClick={() => markAsResolved(s)}
                            aria-label="Mark resolved"
                            className="rounded p-1 text-ink-muted transition-colors hover:bg-surface-container hover:text-status-success-text dark:text-dark-ink-muted"
                            title="Mark resolved"
                          >
                            <Icon name="check_circle" />
                          </button>
                        )}
                        {/* Mark spam */}
                        {s.status !== 'spam' && (
                          <button
                            onClick={() => markAsSpam(s)}
                            aria-label="Mark as spam"
                            className="rounded p-1 text-ink-muted transition-colors hover:bg-surface-container hover:text-status-error-text dark:text-dark-ink-muted"
                            title="Mark as spam"
                          >
                            <Icon name="report" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!submissions.length && (
                  <tr>
                    <td colSpan={10} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">
                      No contact submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsManagement({ accessToken }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAnalyticsSummary(accessToken)
      .then((res) => setSummary(res?.data || null))
      .catch((err) => setError(err?.message || 'Could not load analytics.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;
  if (error) return <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>;
  if (!summary) return <p className="text-body-sm text-ink-muted">No analytics data yet.</p>;

  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
          <p className="font-stat text-stat-md text-brand-dark dark:text-dark-brand">{summary.total_views ?? 0}</p>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Total Page Views</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
          <p className="font-stat text-stat-md text-brand-dark dark:text-dark-brand">{summary.unique_paths ?? 0}</p>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Unique Pages Visited</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Top Pages</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
            <tr><th className="px-stack-lg py-4">Path</th><th className="px-stack-lg py-4">Views</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {(summary.top_pages || []).map((p) => (
              <tr key={p.path} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{p.path}</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.count}</td>
              </tr>
            ))}
            {!(summary.top_pages || []).length && (
              <tr><td colSpan={2} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No page views recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────
function SettingsManagement({ accessToken }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState({ key: '', value: '', group: 'general' });
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchSettings(accessToken).then((res) => setSettings(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (s) => { setEditingKey(s.key); setEditValue(typeof s.value === 'string' ? s.value : JSON.stringify(s.value)); };

  const saveEdit = async (group) => {
    setSaving(true);
    try {
      await upsertSetting(accessToken, editingKey, { value: editValue, group });
      setEditingKey(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const createSetting = async (e) => {
    e.preventDefault();
    if (!newKey.key.trim()) return;
    setSaving(true);
    try {
      await upsertSetting(accessToken, newKey.key.trim(), { value: newKey.value, group: newKey.group || 'general' });
      setNewKey({ key: '', value: '', group: 'general' });
      setShowNew(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (key) => {
    if (!window.confirm(`Delete setting "${key}"?`)) return;
    await deleteSetting(accessToken, key);
    load();
  };

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;

  return (
    <div className="space-y-stack-lg">
      <div className="flex justify-end">
        <Button onClick={() => setShowNew((v) => !v)} variant="primary" size="md" icon={<Icon name="add" />}>New Setting</Button>
      </div>
      {showNew && (
        <form onSubmit={createSetting} className="grid grid-cols-1 gap-3 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface sm:grid-cols-3">
          <input placeholder="Key (e.g. site.title)" value={newKey.key} onChange={(e) => setNewKey({ ...newKey, key: e.target.value })} className={FORM_INPUT_CLASS} />
          <input placeholder="Value" value={newKey.value} onChange={(e) => setNewKey({ ...newKey, value: e.target.value })} className={FORM_INPUT_CLASS} />
          <input placeholder="Group (e.g. general)" value={newKey.group} onChange={(e) => setNewKey({ ...newKey, group: e.target.value })} className={FORM_INPUT_CLASS} />
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit" variant="primary" size="md" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <table className="w-full text-left">
          <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
            <tr><th className="px-stack-lg py-4">Key</th><th className="px-stack-lg py-4">Group</th><th className="px-stack-lg py-4">Value</th><th className="px-stack-lg py-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {settings.map((s) => (
              <tr key={s.key} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
                <td className="px-stack-lg py-4 font-label-caps text-label-caps text-brand">{s.key}</td>
                <td className="px-stack-lg py-4"><Badge className="text-label-caps">{s.group}</Badge></td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">
                  {editingKey === s.key
                    ? <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className={FORM_INPUT_CLASS} autoFocus />
                    : (typeof s.value === 'string' ? s.value : JSON.stringify(s.value))}
                </td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    {editingKey === s.key ? (
                      <>
                        <button onClick={() => saveEdit(s.group)} disabled={saving} aria-label="Save" className="text-brand hover:text-brand-dark"><Icon name="check" /></button>
                        <button onClick={() => setEditingKey(null)} aria-label="Cancel" className="text-ink-muted hover:text-ink"><Icon name="close" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(s)} aria-label={`Edit ${s.key}`} className="text-brand hover:text-brand-dark"><Icon name="edit" /></button>
                        <button onClick={() => remove(s.key)} aria-label={`Delete ${s.key}`} className="text-status-error-text hover:opacity-70"><Icon name="delete" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!settings.length && (
              <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No settings configured yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Training Courses ─────────────────────────────────────────────────────────
// List + create only — the backend (backend/app/routers/training.py) has no
// update/delete endpoint for courses at all, so this deliberately doesn't
// offer edit/delete controls the API can't back.
function NewCourseForm({ accessToken, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', category: '', duration_hours: '', description: '', is_published: true });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true);
    try {
      await createCourse(accessToken, {
        title: form.title,
        category: form.category || undefined,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : undefined,
        description: form.description || undefined,
        is_published: form.is_published,
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create the course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="grid gap-4 sm:grid-cols-3">
        <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Category (e.g. Cloud)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
        <input type="number" min="0" placeholder="Duration (hours)" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />Published (visible to employees)
      </label>
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Course'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function TrainingManagement({ accessToken }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchCourses(accessToken).then((res) => setCourses(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-stack-lg">
      <div className="flex justify-end">
        <Button onClick={() => setShowNew((v) => !v)} variant="primary" size="md" icon={<Icon name="add" />}>New Course</Button>
      </div>
      {showNew && <NewCourseForm accessToken={accessToken} onCreated={() => { setShowNew(false); load(); }} onCancel={() => setShowNew(false)} />}
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
          <table className="w-full text-left">
            <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
              <tr><th className="px-stack-lg py-4">Title</th><th className="px-stack-lg py-4">Category</th><th className="px-stack-lg py-4">Duration</th><th className="px-stack-lg py-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {courses.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{c.title}</td>
                  <td className="px-stack-lg py-4"><Badge className="text-label-caps">{c.category || '—'}</Badge></td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{c.duration_hours ? `${c.duration_hours}h` : '—'}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={c.is_published ? 'success' : 'neutral'}>{c.is_published ? 'published' : 'draft'}</StatusBadge></td>
                </tr>
              ))}
              {!courses.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No courses yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Careers: job postings + application review ──────────────────────────────
function NewCareerForm({ accessToken, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', department: '', location: '', employment_type: 'full_time', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true);
    try {
      await careersApi.create(accessToken, {
        title: form.title,
        department: form.department || undefined,
        location: form.location || undefined,
        employment_type: form.employment_type,
        description: form.description || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create the job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="grid gap-4 sm:grid-cols-3">
        <input required type="text" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
      </div>
      <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className={inputClass}>
        <option value="full_time">Full-time</option>
        <option value="part_time">Part-time</option>
        <option value="contract">Contract</option>
        <option value="internship">Internship</option>
      </select>
      <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Posting...' : 'Post Position'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function CareersManagement({ accessToken }) {
  const [careers, setCareers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      careersApi.list(accessToken, { limit: 100 }),
      fetchApplications(accessToken, statusFilter ? { status: statusFilter } : {}),
    ])
      .then(([c, a]) => { setCareers(c?.data || []); setApplications(a?.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const careerTitleById = Object.fromEntries(careers.map((c) => [c.id, c.title]));

  const setAppStatus = async (id, status) => {
    await updateApplicationStatus(accessToken, id, status);
    load();
  };

  return (
    <div className="space-y-stack-xl">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Open Positions</h3>
          <Button onClick={() => setShowNew((v) => !v)} variant="primary" size="md" icon={<Icon name="add" />}>New Position</Button>
        </div>
        {showNew && <NewCareerForm accessToken={accessToken} onCreated={() => { setShowNew(false); load(); }} onCancel={() => setShowNew(false)} />}
        <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
          {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
            <table className="w-full text-left">
              <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
                <tr><th className="px-stack-lg py-4">Title</th><th className="px-stack-lg py-4">Department</th><th className="px-stack-lg py-4">Location</th><th className="px-stack-lg py-4">Type</th></tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                {careers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
                    <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{c.title}</td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{c.department || '—'}</td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{c.location || '—'}</td>
                    <td className="px-stack-lg py-4"><Badge className="text-label-caps">{c.employment_type?.replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
                {!careers.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No open positions — this list only shows currently-open postings.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Applications</h3>
          <div className="flex gap-2">
            {['', 'applied', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'].map((s) => (
              <button key={s || 'all'} onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${statusFilter === s ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted dark:bg-dark-surface-container'}`}>
                {s || 'all'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
          {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
            <table className="w-full text-left">
              <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
                <tr><th className="px-stack-lg py-4">Applicant</th><th className="px-stack-lg py-4">Position</th><th className="px-stack-lg py-4">Resume</th><th className="px-stack-lg py-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                {applications.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
                    <td className="px-stack-lg py-4">
                      <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{a.full_name}</p>
                      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{a.email}</p>
                    </td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{careerTitleById[a.career_id] || '—'}</td>
                    <td className="px-stack-lg py-4">
                      <a href={a.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-body-sm text-brand hover:text-brand-dark">
                        <Icon name="description" className="text-lg" />Resume
                      </a>
                    </td>
                    <td className="px-stack-lg py-4">
                      <select
                        value={a.status}
                        onChange={(e) => setAppStatus(a.id, e.target.value)}
                        aria-label={`Status for ${a.full_name}`}
                        className="rounded border border-outline-variant bg-white px-2 py-1 text-body-sm dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
                      >
                        {['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!applications.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No applications{statusFilter ? ` with status "${statusFilter}"` : ''} yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Blog Comment Moderation ──────────────────────────────────────────────────
function CommentsManagement({ accessToken }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchComments(accessToken, filter ? { status: filter } : {}).then((res) => setComments(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken, filter]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, status) => { await moderateComment(accessToken, id, status); load(); };
  const remove = async (id) => { if (!window.confirm('Permanently delete this comment?')) return; await deleteComment(accessToken, id); load(); };

  return (
    <div className="space-y-stack-lg">
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${filter === s ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted dark:bg-dark-surface-container'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
          <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 p-stack-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{c.name} <span className="font-normal text-ink-muted">&middot; {c.email}</span></p>
                  <p className="mt-1 text-body-sm text-ink dark:text-white">{c.content}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {c.status !== 'approved' && (
                    <button onClick={() => moderate(c.id, 'approved')} aria-label="Approve comment" className="text-status-success-text hover:opacity-70" title="Approve"><Icon name="check_circle" className="text-xl" /></button>
                  )}
                  {c.status !== 'rejected' && (
                    <button onClick={() => moderate(c.id, 'rejected')} aria-label="Reject comment" className="text-status-error-text hover:opacity-70" title="Reject"><Icon name="cancel" className="text-xl" /></button>
                  )}
                  <button onClick={() => remove(c.id)} aria-label="Delete comment" className="text-ink-muted hover:text-status-error-text" title="Delete"><Icon name="delete" className="text-xl" /></button>
                </div>
              </div>
            ))}
            {!comments.length && <p className="py-8 text-center text-body-sm text-ink-muted">No {filter} comments.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Newsletter Subscribers ───────────────────────────────────────────────────
function NewsletterManagement({ accessToken }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchNewsletterSubscribers(accessToken, { is_active: true }).then((res) => setSubscribers(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Newsletter Subscribers ({subscribers.length} active)</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
          <tr><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Subscribed</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {subscribers.map((s) => (
            <tr key={s.email} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
              <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{s.email}</td>
              <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{s.name || '—'}</td>
              <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
          {!subscribers.length && <tr><td colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No active subscribers yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AuditLogsManagement({ accessToken }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAuditLogs(accessToken, { limit: 50 }).then((res) => setLogs(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
     
  }, [accessToken]);

  return (
    <div className="space-y-stack-lg">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Audit Logs</h3>
        </div>
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
              <tr>
                <th className="px-stack-lg py-4">Action</th>
                <th className="px-stack-lg py-4">Entity</th>
                <th className="px-stack-lg py-4">IP Address</th>
                <th className="px-stack-lg py-4">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {logs.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{l.action}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.entity_type || '—'}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.ip_address || '—'}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!logs.length && (
                <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No audit log entries yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  useDocumentTitle('Admin Panel | CoreFusion Technologies');
  const { user, initializing, accessToken, logout } = useAuth();
  const { denied } = useRoleGuard('admin', '/login');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const [kpis, setKpis] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!user || !accessToken) { setLoading(false); return; }
    if (!initialLoadDone.current) setLoading(true);
    const userRole = user?.role || 'admin';
    setCurrentRole(userRole);
    setCurrentUser({ name: user?.name || user?.email, email: user?.email, role: userRole });
    Promise.allSettled([
      fetchDashboardOverview(accessToken),
      fetchProjectStatusBreakdownApi(accessToken),
    ]).then(([d, sb]) => {
      if (d.status === 'fulfilled') setKpis(d.value?.data || null);
      if (sb.status === 'fulfilled') setStatusBreakdown(sb.value?.data || null);
    }).finally(() => { initialLoadDone.current = true; setLoading(false); });
  }, [user, accessToken]);

  // useRoleGuard already redirects both the unauthenticated case (to
  // /login?returnTo=..., preserving destination) and the wrong-role case —
  // this only needs to keep blocking render for a role the guard doesn't
  // itself know about (a stale currentRole value read before hydration).
  useEffect(() => {
    if (!loading && currentRole && !['admin', 'super_admin'].includes(currentRole)) {
      navigate('/login', { replace: true });
    }
  }, [loading, currentRole, navigate]);

  if (initializing) {
    return <div className="bg-surface-container py-section-padding"><LoadingSpinner /></div>;
  }

  if (!user || denied || (!loading && currentRole && !['admin', 'super_admin'].includes(currentRole))) {
    return <div className="bg-surface-container py-section-padding"><LoadingSpinner /></div>;
  }

  if (loading) {
    return <div className="bg-surface-container py-section-padding"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex h-screen flex-col bg-surface-container dark:bg-dark-surface-container">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-outline-variant bg-brand-dark px-margin-mobile py-3 md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser?.name || 'Admin'} size="lg" />
          <div>
            <h1 className="font-display text-headline-md font-bold text-white">{currentUser?.name || 'Admin'}</h1>
            <p className="text-body-sm text-white/70">{currentUser?.email || ''} &middot; {(currentUser?.role || currentRole || 'admin').replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button as={Link} to="/super-admin/login" variant="primary" size="md" icon={<Icon name="shield_person" />}>
            Super Admin
          </Button>
          <Button variant="primary" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-outline-variant bg-brand-dark md:block">
          <nav className="flex flex-col gap-1 p-3">
            {adminPanelTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-colors ${
                  activeTab === tab.id ? 'bg-white/15 font-bold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-stack-lg flex flex-wrap gap-1 overflow-x-auto border-b border-outline-variant px-margin-mobile py-2 md:hidden">
            {adminPanelTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
                  activeTab === tab.id ? 'border-brand font-bold text-brand' : 'border-transparent font-semibold text-ink-muted hover:border-brand/40 hover:text-ink'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 overflow-auto px-margin-mobile py-stack-lg md:px-margin-desktop">
            {activeTab === 'overview' && <Dashboard kpis={kpis} statusBreakdown={statusBreakdown} accessToken={accessToken} setActiveTab={setActiveTab} />}
            {activeTab === 'content' && <ContentManagement accessToken={accessToken} />}
            {activeTab === 'contacts' && <ContactsManagement accessToken={accessToken} />}
            {activeTab === 'projects' && <ProjectsManagement accessToken={accessToken} />}
            {activeTab === 'users' && <UserManagement accessToken={accessToken} currentRole={currentRole} />}
            {activeTab === 'employees' && <EmployeeManagement accessToken={accessToken} />}
            {activeTab === 'clients' && <ClientManagement accessToken={accessToken} />}
            {activeTab === 'roles' && <RolesManagement accessToken={accessToken} />}
            {activeTab === 'permissions' && <PermissionsManagement accessToken={accessToken} />}
            {activeTab === 'media' && <MediaManagement accessToken={accessToken} />}
            {activeTab === 'notifications' && <NotificationsManagement accessToken={accessToken} />}
            {activeTab === 'reports' && <ReportsManagement accessToken={accessToken} />}
            {activeTab === 'training' && <TrainingManagement accessToken={accessToken} />}
            {activeTab === 'careers' && <CareersManagement accessToken={accessToken} />}
            {activeTab === 'comments' && <CommentsManagement accessToken={accessToken} />}
            {activeTab === 'newsletter' && <NewsletterManagement accessToken={accessToken} />}
            {activeTab === 'analytics' && <AnalyticsManagement accessToken={accessToken} />}
            {activeTab === 'settings' && <SettingsManagement accessToken={accessToken} />}
            {activeTab === 'logs' && <AuditLogsManagement accessToken={accessToken} />}
          </div>
        </div>
      </div>
    </div>
  );
}
