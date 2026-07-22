import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { adminPanelTabs, demoDashboard, demoProjectStatusBreakdown } from '../data/portal.js';
import { PORTAL_ROLE_OPTIONS } from '../data/roles.js';
import {
  fetchUsers, createUser, updateUser, deactivateUser,
  fetchAdminProjects, createProject, updateProject, deleteProject,
  fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
  fetchAnalyticsSummary,
  fetchMedia, deleteMedia, uploadMedia,
  fetchNotifications, markNotificationRead, markAllNotificationsRead, createNotification,
  fetchReports, generateReport, deleteReport,
  fetchAuditLogs,
  fetchEmployees, fetchClients,
  fetchDashboardOverview, fetchProjectStatusBreakdown as fetchProjectStatusBreakdownApi,
  servicesAdmin, solutionsAdmin, caseStudiesAdmin, blogsAdmin, eventsAdmin, downloadsAdmin,
} from '../api/admin.js';
import { fetchCurrentUser } from '../api/auth.js';

const DEMO_EMAIL = 'admin@corefusiontech.com';
const DEMO_PASSWORD = 'ChangeMe@123';

function Dashboard({ kpis: propKpis, statusBreakdown: propBreakdown }) {
  const kpis = propKpis || demoDashboard;
  const statusBreakdown = propBreakdown || demoProjectStatusBreakdown;

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <div className="flex items-center justify-between mb-2">
              <Icon name={s.icon} className={`${s.color} text-2xl`} />
            </div>
            <p className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{s.value}</p>
            <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-gutter">
        <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Project Status Breakdown</h3>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="capitalize text-brand-dark dark:text-dark-brand">{item.status.replace('_', ' ')}</span>
                  <span className="text-ink-muted dark:text-dark-ink-muted">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
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

        <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: 'add_circle', label: 'Create User', desc: 'Add a new employee, client, or partner account' },
              { icon: 'post_add', label: 'New Blog Post', desc: 'Draft and publish a blog article' },
              { icon: 'upload_file', label: 'Upload Resource', desc: 'Add a whitepaper or downloadable asset' },
              { icon: 'campaign', label: 'Send Notification', desc: 'Broadcast a message to all users' },
            ].map((action) => (
              <div key={action.label} className="flex items-center gap-4 p-3 bg-surface-container dark:bg-dark-surface-container rounded-lg hover:bg-outline-variant dark:hover:bg-dark-outline-variant transition-colors cursor-pointer">
                <Icon name={action.icon} className="text-brand text-2xl" />
                <div>
                  <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{action.label}</p>
                  <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark mb-2">Recent Activity</h3>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mb-4">Unresolved contacts: {kpis.unresolved_contacts} | Published blogs: {kpis.published_blogs}</p>
        <div className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
          Last refreshed: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function ContentManagement() {
  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Content Overview</h3>
        <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4">Manage website content including services, solutions, case studies, blog posts, and more.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Services', count: 6, icon: 'settings' },
            { label: 'Solutions', count: 6, icon: 'cloud' },
            { label: 'Case Studies', count: 6, icon: 'description' },
            { label: 'Blog Posts', count: 6, icon: 'article' },
            { label: 'Events', count: 6, icon: 'event' },
            { label: 'Downloads', count: 6, icon: 'download' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 bg-surface-container dark:bg-dark-surface-container rounded-lg">
              <Icon name={item.icon} className="text-brand text-2xl" />
              <div>
                <p className="font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand">{item.label}</p>
                <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{item.count} items</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
      <div className="grid sm:grid-cols-2 gap-4">
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
          {roleError && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{roleError}</p>}
        </label>
      )}

      {submitError && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{submitError}</p>}

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

  const loadUsers = () => {
    if (!accessToken) { setLoadingUsers(false); return; }
    setLoadingUsers(true);
    fetchUsers(accessToken).then((res) => setUsers(res?.data || [])).catch(() => {}).finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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

  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">All Users</h3>
          <Button variant="primary" size="md" icon={<Icon name="person_add" />} onClick={() => { setShowAddForm((v) => !v); setEditingUser(null); }}>
            {showAddForm ? 'Close' : 'Add User'}
          </Button>
        </div>
        {(showAddForm || editingUser) && (
          <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant bg-surface-container dark:bg-dark-surface-container">
            {editingUser ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
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
                {userError && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{userError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" size="md" disabled={submittingUser}>{submittingUser ? 'Updating...' : 'Update User'}</Button>
                  <Button type="button" variant="outline" size="md" onClick={() => { setEditingUser(null); setUserError(''); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <AddUserForm
                accessToken={accessToken}
                currentRole={currentRole}
                onCreated={() => { setShowAddForm(false); loadUsers(); }}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>
        )}
        {loadingUsers ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Role</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{u.name}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{u.email}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted capitalize">{u.role?.replace('_', ' ')}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'active' : 'inactive'}</StatusBadge></td>
                  <td className="px-stack-lg py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(u)} className="text-ink-muted hover:text-brand transition-colors" title="Edit">
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button onClick={() => { if (window.confirm(`Deactivate user "${u.name}"?`)) { deactivateUser(accessToken, u.id).then(loadUsers); }}} className="text-ink-muted hover:text-status-warning-text transition-colors" title="Deactivate">
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

      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">User Roles</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Role</th><th className="px-stack-lg py-4">Users</th><th className="px-stack-lg py-4">Permissions</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {[
              { role: 'Super Admin', users: 2, permissions: 'Full access' },
              { role: 'Admin', users: 8, permissions: 'All except system settings' },
              { role: 'HR', users: 5, permissions: 'Employee management, payroll' },
              { role: 'Marketing', users: 6, permissions: 'Content management, campaigns' },
              { role: 'Sales', users: 12, permissions: 'Client management, opportunities' },
              { role: 'Project Manager', users: 15, permissions: 'Projects, tasks, team' },
              { role: 'Developer', users: 120, permissions: 'Tasks, timesheets, repos' },
              { role: 'Client', users: 85, permissions: 'Client portal access' },
              { role: 'Employee', users: 150, permissions: 'Employee portal access' },
            ].map((r) => (
              <tr key={r.role} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{r.role}</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{r.users}</td>
                <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{r.permissions}</td>
              </tr>
            ))}
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
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Employees</h3>
      </div>
      {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Code</th><th className="px-stack-lg py-4">Designation</th><th className="px-stack-lg py-4">Department</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{e.employee_code}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{e.designation || '—'}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{e.department_name || '—'}</td>
                <td className="px-stack-lg py-4"><StatusBadge variant={e.status === 'active' ? 'success' : 'neutral'}>{e.status}</StatusBadge></td>
              </tr>
            ))}
            {!employees.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No employees found.</td></tr>}
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
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Clients</h3>
      </div>
      {loading ? <div className="p-stack-lg"><LoadingSpinner /></div> : (
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Company</th><th className="px-stack-lg py-4">Industry</th><th className="px-stack-lg py-4">Country</th><th className="px-stack-lg py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
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
      <div className="grid sm:grid-cols-2 gap-4">
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
      {error && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
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

  const loadProjects = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAdminProjects(accessToken, { limit: 50 }).then((res) => setProjects(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">All Projects</h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => { setShowAddForm((v) => !v); setEditingProject(null); }}>
            {showAddForm ? 'Close' : 'New Project'}
          </Button>
        </div>
        {(showAddForm || editingProject) && (
          <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant bg-surface-container dark:bg-dark-surface-container">
            {editingProject ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
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
                {projectError && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{projectError}</p>}
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
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
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
                <tr key={p.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
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
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(p)} className="text-ink-muted hover:text-brand transition-colors" title="Edit">
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button onClick={() => remove(p)} className="text-ink-muted hover:text-status-error-text transition-colors" title="Delete">
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
      <div className="grid sm:grid-cols-2 gap-4">
        <input required type="text" placeholder="Role name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Slug (e.g. content-editor)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      {error && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
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
      <div className="grid sm:grid-cols-3 gap-4">
        <input required type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Module (e.g. projects)" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Action (e.g. delete)" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className={inputClass} />
      </div>
      {error && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Permission'}</Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function RolesManagement({ accessToken }) {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showPermForm, setShowPermForm] = useState(false);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchRoles(accessToken, { limit: 50 }), fetchPermissions(accessToken, { limit: 100 })])
      .then(([r, p]) => {
        if (r.status === 'fulfilled') setRoles(r.value?.data || []);
        if (p.status === 'fulfilled') setPermissions(p.value?.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const removeRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try { await deleteRole(accessToken, role.id); load(); } catch { /* row stays visible on failure */ }
  };

  const removePermission = async (perm) => {
    if (!window.confirm(`Delete permission "${perm.name}"?`)) return;
    try { await deletePermission(accessToken, perm.id); load(); } catch { /* row stays visible on failure */ }
  };

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;

  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Custom Roles</h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowRoleForm((v) => !v)}>
            {showRoleForm ? 'Close' : 'New Role'}
          </Button>
        </div>
        {showRoleForm && (
          <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant bg-surface-container dark:bg-dark-surface-container">
            <AddRoleForm accessToken={accessToken} onCreated={() => { setShowRoleForm(false); load(); }} onCancel={() => setShowRoleForm(false)} />
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Slug</th><th className="px-stack-lg py-4">Description</th><th className="px-stack-lg py-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {roles.map((r) => (
              <tr key={r.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{r.name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.slug}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.description || '—'}</td>
                <td className="px-stack-lg py-4 text-right">
                  {!r.is_system && (
                    <button onClick={() => removeRole(r)} className="text-ink-muted hover:text-status-error-text transition-colors">
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

      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Permissions</h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowPermForm((v) => !v)}>
            {showPermForm ? 'Close' : 'New Permission'}
          </Button>
        </div>
        {showPermForm && (
          <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant bg-surface-container dark:bg-dark-surface-container">
            <AddPermissionForm accessToken={accessToken} onCreated={() => { setShowPermForm(false); load(); }} onCancel={() => setShowPermForm(false)} />
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Module</th><th className="px-stack-lg py-4">Action</th><th className="px-stack-lg py-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {permissions.map((p) => (
              <tr key={p.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{p.name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.module}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.action}</td>
                <td className="px-stack-lg py-4 text-right">
                  <button onClick={() => removePermission(p)} className="text-ink-muted hover:text-status-error-text transition-colors">
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
    </div>
  );
}

function AnalyticsPage({ accessToken }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAnalyticsSummary(accessToken).then((res) => setSummary(res?.data || null)).catch(() => {}).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (loading) return <div className="p-stack-lg"><LoadingSpinner /></div>;

  const totalViews = summary?.total_views ?? 0;
  const topPages = summary?.top_pages || [];

  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-gutter">
        <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <Icon name="visibility" className="text-brand text-2xl mb-2" />
          <p className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{totalViews.toLocaleString()}</p>
          <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">Total Page Views</p>
        </div>
        <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <Icon name="link" className="text-status-info-text text-2xl mb-2" />
          <p className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{(summary?.unique_paths ?? 0).toLocaleString()}</p>
          <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">Unique Pages</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Top Pages</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Path</th><th className="px-stack-lg py-4">Views</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {topPages.map((row) => (
              <tr key={row.path} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{row.path}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{row.count.toLocaleString()}</td>
              </tr>
            ))}
            {!topPages.length && (
              <tr><td colSpan={2} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No page views recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
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

  const loadMedia = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchMedia(accessToken, { limit: 60 }).then((res) => setMedia(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Media Library</h3>
          <label className="bg-brand text-white px-4 py-2.5 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-all cursor-pointer flex items-center gap-2">
            <Icon name="upload_file" className="text-lg" />
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        {error && <p className="px-stack-lg pt-4 text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <div className="p-stack-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {media.map((m) => (
              <div key={m.id} className="border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden group relative">
                {m.mime_type?.startsWith('image/') ? (
                  <img src={m.url} alt={m.file_name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center bg-surface-container dark:bg-dark-surface-container">
                    <Icon name={mediaIcon(m.mime_type)} className="text-4xl text-ink-muted" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-body-sm text-brand-dark dark:text-dark-brand truncate" title={m.file_name}>{m.file_name}</p>
                  <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{m.folder}</p>
                </div>
                <button onClick={() => remove(m)} className="absolute top-2 right-2 bg-white/90 dark:bg-dark-surface/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-status-error-text">
                  <Icon name="delete" className="text-base" />
                </button>
              </div>
            ))}
            {!media.length && (
              <p className="col-span-full text-center text-body-sm text-ink-muted py-8">No media uploaded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const NOTIFICATION_ICON = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };
const NOTIFICATION_VARIANT = { info: 'info', success: 'success', warning: 'warning', error: 'error' };

function NotificationsManagement({ accessToken }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchNotifications(accessToken).then((res) => setNotifications(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const markOne = async (n) => {
    try { await markNotificationRead(accessToken, n.id); load(); } catch { /* row stays unread on failure */ }
  };

  const markAll = async () => {
    try { await markAllNotificationsRead(accessToken); load(); } catch { /* list stays unchanged on failure */ }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
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
                <Icon name={NOTIFICATION_ICON[n.type] || 'info'} className={`text-2xl mt-0.5 text-status-${NOTIFICATION_VARIANT[n.type] || 'info'}-text`} />
                <div className="flex-1">
                  <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{n.title}</p>
                  {n.message && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{n.message}</p>}
                  <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markOne(n)} className="text-ink-muted hover:text-brand transition-colors" title="Mark as read">
                    <Icon name="check" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
            {!notifications.length && (
              <p className="text-center text-body-sm text-ink-muted py-8">No notifications.</p>
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
      <div className="grid sm:grid-cols-3 gap-4">
        <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Type (e.g. financial)" value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })} className={inputClass} />
        <input required type="text" placeholder="Period (e.g. Q1 2026)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Summary (optional)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${inputClass} w-full`} rows={2} />
      {error && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
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

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchReports(accessToken, { limit: 50 }).then((res) => setReports(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const remove = async (report) => {
    if (!window.confirm(`Delete report "${report.title}"?`)) return;
    try { await deleteReport(accessToken, report.id); load(); } catch { /* row stays visible on failure */ }
  };

  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Reports</h3>
          <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close' : 'Generate Report'}
          </Button>
        </div>
        {showForm && (
          <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant bg-surface-container dark:bg-dark-surface-container">
            <GenerateReportForm accessToken={accessToken} onCreated={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
          </div>
        )}
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr><th className="px-stack-lg py-4">Title</th><th className="px-stack-lg py-4">Type</th><th className="px-stack-lg py-4">Period</th><th className="px-stack-lg py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{r.title}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted capitalize">{r.report_type}</td>
                  <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.period}</td>
                  <td className="px-stack-lg py-4 text-right flex items-center justify-end gap-3">
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-brand transition-colors">
                        <Icon name="download" className="text-lg" />
                      </a>
                    )}
                    <button onClick={() => remove(r)} className="text-ink-muted hover:text-status-error-text transition-colors">
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

function AuditLogsManagement({ accessToken }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchAuditLogs(accessToken, { limit: 50 }).then((res) => setLogs(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Audit Logs</h3>
        </div>
        {loading ? (
          <div className="p-stack-lg"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr>
                <th className="px-stack-lg py-4">Action</th>
                <th className="px-stack-lg py-4">Entity</th>
                <th className="px-stack-lg py-4">IP Address</th>
                <th className="px-stack-lg py-4">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!user || !accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      fetchDashboardOverview(accessToken),
      fetchProjectStatusBreakdownApi(accessToken),
      fetchCurrentUser(accessToken),
    ]).then(([d, sb, me]) => {
      if (d.status === 'fulfilled') setKpis(d.value?.data || null);
      if (sb.status === 'fulfilled') setStatusBreakdown(sb.value?.data || null);
      if (me.status === 'fulfilled') {
        setCurrentRole(me.value?.data?.role || null);
        setCurrentUser(me.value?.data || null);
      }
    }).finally(() => setLoading(false));
  }, [user, accessToken]);

  if (initializing) {
    return <div className="py-section-padding bg-surface-container"><LoadingSpinner /></div>;
  }

  if (!user) { navigate('/login', { replace: true }); return null; }

  if (loading) {
    return <div className="py-section-padding bg-surface-container"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-section-padding bg-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser?.name || 'Admin'} size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-white font-bold">{currentUser?.name || 'Admin'}</h1>
              <p className="text-body-sm text-white/70">{currentUser?.email || ''} &middot; {(currentUser?.role || currentRole || 'admin').replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button as={Link} to="/super-admin" variant="primary" size="md" icon={<Icon name="shield_person" />}>
              Super Admin
            </Button>
            <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="flex gap-stack-lg">
          <aside className="w-56 shrink-0 hidden md:block">
            <nav className="flex flex-col gap-1">
              {adminPanelTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-caps text-label-caps uppercase text-left transition-colors ${
                    activeTab === tab.id ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}>
                  <Icon name={tab.icon} className="text-lg" />{tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex md:hidden flex-wrap gap-1 mb-stack-lg border-b border-outline-variant overflow-x-auto">
            {adminPanelTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-brand font-bold border-brand' : 'text-ink-muted font-semibold border-transparent hover:text-ink hover:border-outline-variant'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && <Dashboard kpis={kpis} statusBreakdown={statusBreakdown} />}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'projects' && <ProjectsManagement accessToken={accessToken} />}
            {activeTab === 'users' && <UserManagement accessToken={accessToken} currentRole={currentRole} />}
            {activeTab === 'employees' && <EmployeeManagement accessToken={accessToken} />}
            {activeTab === 'clients' && <ClientManagement accessToken={accessToken} />}
            {activeTab === 'roles' && <RolesManagement accessToken={accessToken} />}
            {activeTab === 'analytics' && <AnalyticsPage accessToken={accessToken} />}
            {activeTab === 'media' && <MediaManagement accessToken={accessToken} />}
            {activeTab === 'notifications' && <NotificationsManagement accessToken={accessToken} />}
            {activeTab === 'reports' && <ReportsManagement accessToken={accessToken} />}
            {activeTab === 'logs' && <AuditLogsManagement accessToken={accessToken} />}
          </div>
        </div>
      </div>
    </div>
  );
}
