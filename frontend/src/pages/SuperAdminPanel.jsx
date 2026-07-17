import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { demoDashboard } from '../data/portal.js';
import { fetchAdminKPIs } from '../lib/db.js';
import { fetchCurrentUser } from '../api/auth.js';
import {
  fetchDepartments, createDepartment, deleteDepartment,
  fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
  fetchUsers, exportUserData, anonymizeUser,
  fetchAuditLogs,
} from '../api/admin.js';



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
  const { user, initializing, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchCurrentUser(accessToken).then((res) => setCurrentUser(res?.data || null)).catch(() => {});
  }, [accessToken]);

  if (initializing) return <div className="py-section-padding bg-white"><LoadingSpinner /></div>;
  if (!user) { navigate('/login', { replace: true }); return null; }

  return (
    <div className="py-section-padding bg-white">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser?.name || 'Super Admin'} size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-black font-bold">{currentUser?.name || 'Super Admin'}</h1>
              <p className="text-body-sm text-black">{currentUser?.email || ''} &middot; super admin</p>
            </div>
          </div>
          <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
            Sign Out
          </Button>
        </div>

        <div className="flex gap-stack-lg">
          <aside className="w-56 shrink-0 hidden md:block">
            <nav className="flex flex-col gap-1">
              {superAdminTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-caps text-label-caps uppercase text-left transition-colors ${
                    activeTab === tab.id ? 'bg-brand/10 text-brand font-bold' : 'text-ink-muted hover:bg-surface-container hover:text-ink'
                  }`}>
                  <Icon name={tab.icon} className="text-lg" />{tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex md:hidden flex-wrap gap-1 mb-stack-lg border-b border-outline-variant overflow-x-auto">
            {superAdminTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-brand font-bold border-brand' : 'text-ink-muted font-semibold border-transparent hover:text-ink hover:border-outline-variant'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0">
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
      </div>
    </div>
  );
}