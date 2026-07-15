import { useState, useEffect } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { demoDashboard } from '../data/portal.js';
import { fetchAdminKPIs } from '../lib/db.js';
import { loginToPortal } from '../lib/portalAuth.js';
import {
  fetchDepartments, createDepartment, deleteDepartment,
  fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
  fetchUsers, exportUserData, anonymizeUser,
  fetchAuditLogs,
} from '../api/admin.js';

const SUPER_ADMIN_PORTAL_ROLES = ['super_admin'];

const superAdminTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'departments', label: 'Departments', icon: 'apartment' },
  { id: 'roles', label: 'Roles & Permissions', icon: 'verified_user' },
  { id: 'gdpr', label: 'Data Export / GDPR', icon: 'privacy_tip' },
  { id: 'audit', label: 'Audit Logs', icon: 'history' },
  { id: 'billing', label: 'Billing', icon: 'account_balance' },
  { id: 'impersonation', label: 'Impersonation', icon: 'switch_account' },
];

const FORM_INPUT_CLASS = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';
const LOGIN_INPUT_CLASS = 'border border-outline-variant rounded px-4 py-3 text-body-md text-ink bg-white focus:outline-none focus:border-brand';

function RowAction({ onClick, disabled, variant = 'primary', children }) {
  const styles = variant === 'primary'
    ? 'border-brand text-brand hover:bg-brand hover:text-white'
    : variant === 'danger'
      ? 'border-status-error-text text-status-error-text hover:bg-status-error-text hover:text-white'
      : 'border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted hover:border-brand hover:text-brand';
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`text-label-caps uppercase font-label-caps px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${styles}`}>
      {children}
    </button>
  );
}

function ComingSoon({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg text-center py-12">
      <Icon name={icon} className="text-4xl text-ink-muted dark:text-dark-ink-muted mb-3" />
      <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-2">{title}</h3>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted max-w-md mx-auto">{description}</p>
    </div>
  );
}

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
      await loginToPortal(login, email, password, SUPER_ADMIN_PORTAL_ROLES);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-card-hover p-stack-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center">
            <Icon name="shield_person" className="text-white text-xl" />
          </div>
          <div>
            <h1 className="font-display text-headline-sm text-brand-dark">Super Admin</h1>
            <p className="text-body-sm text-ink-muted">Sign in with a Super Admin account</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@corefusiontech.com" className={LOGIN_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Password</span>
            <div className="relative">
              <input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={LOGIN_INPUT_CLASS} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>
          {error && <p className="text-status-error-text text-body-sm flex items-center gap-1"><Icon name="error" className="text-base" />{error}</p>}
          <button type="submit" disabled={submitting} className="bg-brand-dark text-white h-11 rounded font-label-caps text-label-caps uppercase hover:opacity-90 transition-all active:scale-95 disabled:opacity-60">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Overview() {
  const [kpis, setKpis] = useState(demoDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminKPIs().then(setKpis).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  const cards = [
    { label: 'Employees', value: kpis.total_employees, icon: 'badge' },
    { label: 'Clients', value: kpis.total_clients, icon: 'business' },
    { label: 'Projects', value: kpis.total_projects, icon: 'folder' },
    { label: 'Revenue', value: `$${(kpis.total_revenue / 1000000).toFixed(1)}M`, icon: 'payments' },
  ];
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <Icon name={c.icon} className="text-brand text-2xl mb-2" />
            <p className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{c.value}</p>
            <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
          This company-wide summary plus every screen in Admin Panel is available here. The tabs on the left are exclusive to Super Admin:
          org structure, the global role/permission matrix, GDPR tooling, and the full audit trail.
        </p>
      </div>
    </div>
  );
}

function Departments({ accessToken }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchDepartments(accessToken).then((r) => setDepartments(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      await createDepartment(accessToken, form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    setActingId(id);
    try { await deleteDepartment(accessToken, id); load(); } finally { setActingId(null); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>New Department</Button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input required type="text" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={FORM_INPUT_CLASS} />
            <input type="text" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={FORM_INPUT_CLASS} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Description</th><th className="px-stack-lg py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{d.name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{d.description || '—'}</td>
                <td className="px-stack-lg py-4"><RowAction variant="danger" disabled={actingId === d.id} onClick={() => remove(d.id)}>Delete</RowAction></td>
              </tr>
            ))}
            {!departments.length && <tr><td colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No departments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RolesPermissions({ accessToken }) {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleForm, setRoleForm] = useState({ name: '', slug: '', description: '' });
  const [permForm, setPermForm] = useState({ name: '', module: '', action: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchRoles(accessToken), fetchPermissions(accessToken)]).then(([r, p]) => {
      if (r.status === 'fulfilled') setRoles(r.value?.data || []);
      if (p.status === 'fulfilled') setPermissions(p.value?.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name || !roleForm.slug) return;
    setSubmitting(true);
    try { await createRole(accessToken, roleForm); setRoleForm({ name: '', slug: '', description: '' }); load(); } finally { setSubmitting(false); }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    if (!permForm.name || !permForm.module || !permForm.action) return;
    setSubmitting(true);
    try { await createPermission(accessToken, permForm); setPermForm({ name: '', module: '', action: '' }); load(); } finally { setSubmitting(false); }
  };

  const removeRole = async (id) => { setActingId(id); try { await deleteRole(accessToken, id); load(); } finally { setActingId(null); } };
  const removePermission = async (id) => { setActingId(id); try { await deletePermission(accessToken, id); load(); } finally { setActingId(null); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Custom Roles</h3>
        <form onSubmit={handleCreateRole} className="grid sm:grid-cols-3 gap-4">
          <input required type="text" placeholder="Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className={FORM_INPUT_CLASS} />
          <input required type="text" placeholder="Slug (e.g. regional-lead)" value={roleForm.slug} onChange={(e) => setRoleForm({ ...roleForm, slug: e.target.value })} className={FORM_INPUT_CLASS} />
          <div className="flex gap-2">
            <input type="text" placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} className={`flex-1 ${FORM_INPUT_CLASS}`} />
            <Button type="submit" variant="primary" size="md" disabled={submitting}>Add</Button>
          </div>
        </form>
        <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{r.name} {r.is_system && <StatusBadge variant="neutral">system</StatusBadge>}</p>
                <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.slug} — {r.description || 'No description'}</p>
              </div>
              {!r.is_system && <RowAction variant="danger" disabled={actingId === r.id} onClick={() => removeRole(r.id)}>Delete</RowAction>}
            </div>
          ))}
          {!roles.length && <p className="text-body-sm text-ink-muted text-center py-6">No custom roles yet — the 13 system roles from `UserRole` cover most needs.</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg space-y-4">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Permissions</h3>
        <form onSubmit={handleCreatePermission} className="grid sm:grid-cols-4 gap-4">
          <input required type="text" placeholder="Name" value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} className={FORM_INPUT_CLASS} />
          <input required type="text" placeholder="Module (e.g. invoices)" value={permForm.module} onChange={(e) => setPermForm({ ...permForm, module: e.target.value })} className={FORM_INPUT_CLASS} />
          <input required type="text" placeholder="Action (e.g. approve)" value={permForm.action} onChange={(e) => setPermForm({ ...permForm, action: e.target.value })} className={FORM_INPUT_CLASS} />
          <Button type="submit" variant="primary" size="md" disabled={submitting}>Add</Button>
        </form>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {permissions.map((p) => (
            <div key={p.id} className="border border-outline-variant dark:border-dark-outline-variant rounded p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-body-sm font-semibold text-brand-dark dark:text-dark-brand">{p.name}</p>
                <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.module}.{p.action}</p>
              </div>
              <RowAction variant="danger" disabled={actingId === p.id} onClick={() => removePermission(p.id)}>×</RowAction>
            </div>
          ))}
          {!permissions.length && <p className="text-body-sm text-ink-muted text-center py-6 sm:col-span-2 lg:col-span-3">No permissions defined yet.</p>}
        </div>
      </div>
    </div>
  );
}

function DataExportGdpr({ accessToken }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [exportedJson, setExportedJson] = useState(null);

  const runSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const r = await fetchUsers(accessToken, { search, limit: 10 });
      setResults(r?.data || []);
    } finally {
      setSearching(false);
    }
  };

  const doExport = async (userId) => {
    setActingId(userId);
    try {
      const r = await exportUserData(accessToken, userId);
      setExportedJson(r?.data || null);
    } finally {
      setActingId(null);
    }
  };

  const doAnonymize = async (userId) => {
    if (!window.confirm('This permanently anonymizes the account (name, email, phone, avatar) and deactivates it. This cannot be undone. Continue?')) return;
    setActingId(userId);
    try { await anonymizeUser(accessToken, userId); setResults((prev) => prev.filter((u) => u.id !== userId)); } finally { setActingId(null); }
  };

  return (
    <div className="space-y-stack-md">
      <form onSubmit={runSearch} className="flex gap-2">
        <input type="text" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className={`flex-1 ${FORM_INPUT_CLASS}`} />
        <Button type="submit" variant="primary" size="md" disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
      </form>
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
            <tr><th className="px-stack-lg py-4">Name</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Role</th><th className="px-stack-lg py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {results.map((u) => (
              <tr key={u.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{u.name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{u.email}</td>
                <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted capitalize">{u.role?.replace('_', ' ')}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    <RowAction disabled={actingId === u.id} onClick={() => doExport(u.id)}>Export Data</RowAction>
                    <RowAction variant="danger" disabled={actingId === u.id} onClick={() => doAnonymize(u.id)}>Anonymize</RowAction>
                  </div>
                </td>
              </tr>
            ))}
            {!results.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">Search for a user to export or anonymize their data.</td></tr>}
          </tbody>
        </table>
      </div>
      {exportedJson && (
        <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-3">Exported Data</h3>
          <pre className="text-body-sm bg-surface-container dark:bg-dark-surface-container rounded p-4 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(exportedJson, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function AuditLogs({ accessToken }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchAuditLogs(accessToken, { limit: 50 }).then((r) => setLogs(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
          <tr><th className="px-stack-lg py-4">Action</th><th className="px-stack-lg py-4">Entity</th><th className="px-stack-lg py-4">IP</th><th className="px-stack-lg py-4">When</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {logs.map((l) => (
            <tr key={l.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
              <td className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-dark-brand">{l.action}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.entity_type || '—'}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.ip_address || '—'}</td>
              <td className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
            </tr>
          ))}
          {!logs.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No audit activity yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function SuperAdminPanel() {
  useDocumentTitle('Super Admin | CoreFusion Technologies');
  const { initializing, accessToken, logout } = useAuth();
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (initializing) return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name="Super Admin" size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-white font-bold">Super Admin</h1>
              <p className="text-body-sm text-white/70">Unrestricted system control</p>
            </div>
          </div>
          <button onClick={() => { logout(); setAuthed(false); }} className="border border-white/40 text-white font-bold px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-brand hover:text-brand transition-all">
            Sign Out
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-stack-lg border-b border-white/20 overflow-x-auto">
          {superAdminTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-white font-bold border-brand' : 'text-white/70 font-semibold border-transparent hover:text-white hover:border-white/40'
              }`}>
              <Icon name={tab.icon} className="text-lg" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <Overview />}
        {activeTab === 'departments' && <Departments accessToken={accessToken} />}
        {activeTab === 'roles' && <RolesPermissions accessToken={accessToken} />}
        {activeTab === 'gdpr' && <DataExportGdpr accessToken={accessToken} />}
        {activeTab === 'audit' && <AuditLogs accessToken={accessToken} />}
        {activeTab === 'billing' && (
          <ComingSoon icon="account_balance" title="Billing & Subscription"
            description="This deployment doesn't have a billing/subscription model yet — there's no plan, invoice-to-platform, or metering system in the current schema. Building it for real is a separate project, not a UI-only add-on." />
        )}
        {activeTab === 'impersonation' && (
          <ComingSoon icon="switch_account" title="Impersonation"
            description="Deliberately not implemented yet. Signing in as another user safely requires audit-logged, time-boxed session tokens and its own review — that's a security-sensitive feature that shouldn't ship as a quick add-on." />
        )}
      </div>
    </div>
  );
}
