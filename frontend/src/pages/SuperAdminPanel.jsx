import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import RowAction from '../components/ui/RowAction.jsx';
import { FORM_INPUT_CLASS } from '../components/ui/formClasses.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import { useAuth } from '../context/AuthContext.jsx';
// demo data removed — all data now fetched from API
import { fetchAdminKPIs } from '../lib/db.js';
import { fetchCurrentUser } from '../api/auth.js';
import {
  fetchDepartments, createDepartment, deleteDepartment,
  fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
  fetchUsers, exportUserData, anonymizeUser,
  fetchAuditLogs,
} from '../api/admin.js';

const TABLE_HEADER = 'bg-slate-100 font-label-caps text-label-caps uppercase text-slate-500';
const TABLE_HEADER_TH = 'px-stack-lg py-4 text-left';
const TABLE_ROW_HOVER = 'transition-colors hover:bg-slate-100';
const superAdminTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'departments', label: 'Departments', icon: 'apartment' },
  { id: 'roles', label: 'Roles & Permissions', icon: 'verified_user' },
  { id: 'gdpr', label: 'Data Export / GDPR', icon: 'privacy_tip' },
  { id: 'audit', label: 'Audit Logs', icon: 'history' },
  { id: 'billing', label: 'Billing', icon: 'account_balance' },
  { id: 'impersonation', label: 'Impersonation', icon: 'switch_account' },
];

function ComingSoon({ icon, title, description }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-stack-lg py-12 text-center">
      <Icon name={icon} className="mb-3 text-4xl text-slate-400" />
      <h3 className="mb-2 font-display text-headline-sm text-slate-900">{title}</h3>
      <p className="mx-auto max-w-md text-body-sm text-slate-500">{description}</p>
    </div>
  );
}

function Overview() {
  const [kpis, setKpis] = useState({ total_employees: 0, total_clients: 0, total_projects: 0, active_projects: 0, open_tasks: 0, total_revenue: 0, open_tickets: 0, new_applications: 0, unresolved_contacts: 0, published_blogs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminKPIs().then(setKpis).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  const cards = [
    { label: 'Employees', value: kpis.total_employees, icon: 'badge', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clients', value: kpis.total_clients, icon: 'business', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Projects', value: kpis.total_projects, icon: 'folder', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Revenue', value: `$${(kpis.total_revenue / 1000000).toFixed(1)}M`, icon: 'payments', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-stack-lg shadow-sm">
            <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-lg ${c.bg}`}>
              <Icon name={c.icon} className={`text-xl ${c.color}`} />
            </div>
            <p className="font-stat text-stat-lg text-slate-900">{c.value}</p>
            <p className="font-label-caps text-label-caps text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-stack-lg shadow-sm">
        <p className="text-body-sm text-slate-500">
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

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    fetchDepartments(accessToken).then((r) => setDepartments(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

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
        <form onSubmit={handleCreate} className="space-y-4 rounded-lg border border-slate-200 bg-white p-stack-lg shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required type="text" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={FORM_INPUT_CLASS} />
            <input type="text" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={FORM_INPUT_CLASS} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className={TABLE_HEADER}>
            <tr><th className={TABLE_HEADER_TH}>Name</th><th className={TABLE_HEADER_TH}>Description</th><th className={TABLE_HEADER_TH}>Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((d) => (
              <tr key={d.id} className={TABLE_ROW_HOVER}>
                <td className="px-stack-lg py-4 text-body-md font-medium text-slate-900">{d.name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-500">{d.description || '—'}</td>
                <td className="px-stack-lg py-4"><RowAction variant="danger" disabled={actingId === d.id} onClick={() => remove(d.id)}>Delete</RowAction></td>
              </tr>
            ))}
            {!departments.length && <tr><td colSpan={3} className="px-stack-lg py-8 text-center text-body-sm text-slate-400">No departments yet.</td></tr>}
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

  const load = useCallback(() => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchRoles(accessToken), fetchPermissions(accessToken)]).then(([r, p]) => {
      if (r.status === 'fulfilled') setRoles(r.value?.data || []);
      if (p.status === 'fulfilled') setPermissions(p.value?.data || []);
    }).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

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
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-stack-lg shadow-sm">
        <h3 className="font-display text-headline-sm text-slate-900">Custom Roles</h3>
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <input required type="text" placeholder="Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className={FORM_INPUT_CLASS} />
            <input required type="text" placeholder="Slug (e.g. regional-lead)" value={roleForm.slug} onChange={(e) => setRoleForm({ ...roleForm, slug: e.target.value })} className={FORM_INPUT_CLASS} />
            <input type="text" placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} className={FORM_INPUT_CLASS} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Adding...' : 'Add Role'}</Button>
          </div>
        </form>
        <div className="divide-y divide-slate-100">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-body-md font-semibold text-slate-900">{r.name} {r.is_system && <StatusBadge variant="neutral">system</StatusBadge>}</p>
                <p className="text-body-sm text-slate-500">{r.slug} — {r.description || 'No description'}</p>
              </div>
              {!r.is_system && <RowAction variant="danger" disabled={actingId === r.id} onClick={() => removeRole(r.id)}>Delete</RowAction>}
            </div>
          ))}
          {!roles.length && <p className="py-6 text-center text-body-sm text-slate-400">No custom roles yet — the 13 system roles from `UserRole` cover most needs.</p>}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-stack-lg shadow-sm">
        <h3 className="font-display text-headline-sm text-slate-900">Permissions</h3>
        <form onSubmit={handleCreatePermission} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <input required type="text" placeholder="Name" value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} className={FORM_INPUT_CLASS} />
            <input required type="text" placeholder="Module (e.g. invoices)" value={permForm.module} onChange={(e) => setPermForm({ ...permForm, module: e.target.value })} className={FORM_INPUT_CLASS} />
            <input required type="text" placeholder="Action (e.g. approve)" value={permForm.action} onChange={(e) => setPermForm({ ...permForm, action: e.target.value })} className={FORM_INPUT_CLASS} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Adding...' : 'Add Permission'}</Button>
          </div>
        </form>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {permissions.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-100">
              <div>
                <p className="text-body-sm font-semibold text-slate-900">{p.name}</p>
                <p className="text-body-sm text-slate-500">{p.module}.{p.action}</p>
              </div>
              <button type="button" onClick={() => removePermission(p.id)} disabled={actingId === p.id}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`Delete permission ${p.name}`}>
                <Icon name="delete" className="text-base" />
              </button>
            </div>
          ))}
          {!permissions.length && <p className="py-6 text-center text-body-sm text-slate-400 sm:col-span-2 lg:col-span-3">No permissions defined yet.</p>}
        </div>
      </div>
    </div>
  );
}

function DataExportGdpr({ accessToken }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [exportedJson, setExportedJson] = useState(null);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetchUsers(accessToken, { limit: 50 }).then((r) => setResults(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [accessToken]);

  const runSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const r = await fetchUsers(accessToken, { search: search.trim() || undefined, limit: 50 });
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-stack-md">
      <form onSubmit={runSearch} className="flex gap-2">
        <input type="text" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className={`flex-1 ${FORM_INPUT_CLASS}`} />
        <Button type="submit" variant="primary" size="md" disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className={TABLE_HEADER}>
            <tr><th className={TABLE_HEADER_TH}>Name</th><th className={TABLE_HEADER_TH}>Email</th><th className={TABLE_HEADER_TH}>Role</th><th className={TABLE_HEADER_TH}>Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((u) => (
              <tr key={u.id} className={TABLE_ROW_HOVER}>
                <td className="px-stack-lg py-4 text-body-md font-medium text-slate-900">{u.name}</td>
                <td className="px-stack-lg py-4 text-body-sm text-slate-500">{u.email}</td>
                <td className="px-stack-lg py-4 text-body-sm capitalize text-slate-500">{u.role?.replace('_', ' ')}</td>
                <td className="px-stack-lg py-4">
                  <div className="flex gap-2">
                    <RowAction disabled={actingId === u.id} onClick={() => doExport(u.id)}>Export Data</RowAction>
                    <RowAction variant="danger" disabled={actingId === u.id} onClick={() => doAnonymize(u.id)}>Anonymize</RowAction>
                  </div>
                </td>
              </tr>
            ))}
            {!results.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-slate-400">Search for a user to export or anonymize their data.</td></tr>}
          </tbody>
        </table>
      </div>
      {exportedJson && (
        <div className="rounded-lg border border-slate-200 bg-white p-stack-lg shadow-sm">
          <h3 className="mb-3 font-display text-headline-sm text-slate-900">Exported Data</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-body-sm text-slate-700">{JSON.stringify(exportedJson, null, 2)}</pre>
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className={TABLE_HEADER}>
          <tr><th className={TABLE_HEADER_TH}>Action</th><th className={TABLE_HEADER_TH}>Entity</th><th className={TABLE_HEADER_TH}>IP</th><th className={TABLE_HEADER_TH}>When</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((l) => (
            <tr key={l.id} className={TABLE_ROW_HOVER}>
              <td className="px-stack-lg py-4 text-body-sm font-medium text-slate-900">{l.action}</td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-500">{l.entity_type || '—'}</td>
              <td className="px-stack-lg py-4 font-mono text-body-xs text-slate-500">{l.ip_address || '—'}</td>
              <td className="px-stack-lg py-4 text-body-sm text-slate-500">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
            </tr>
          ))}
          {!logs.length && <tr><td colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-slate-400">No audit activity yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function SuperAdminPanel() {
  useDocumentTitle('Super Admin | CoreFusion Technologies');
  const { user, initializing, accessToken, logout } = useAuth();
  const { denied } = useRoleGuard('super_admin', '/admin');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchCurrentUser(accessToken).then((res) => setCurrentUser(res?.data || null)).catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    if (!initializing && !user) navigate('/login', { replace: true });
  }, [initializing, user, navigate]);
  useEffect(() => {
    if (currentUser !== null && (denied || currentUser.role !== 'super_admin')) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, denied, navigate]);

  if (initializing || !user || denied || currentUser === null || currentUser.role !== 'super_admin') {
    return <div className="bg-slate-50 py-section-padding"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop">
        <div className="sticky top-0 z-20 mb-stack-lg flex items-center justify-between gap-4 border-b border-slate-200 bg-white py-3">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser?.name || 'Super Admin'} size="lg" />
            <div>
              <h1 className="font-display text-headline-md font-bold text-slate-900">{currentUser?.name || 'Super Admin'}</h1>
              <p className="text-body-sm text-slate-500">{currentUser?.email || ''} &middot; super admin</p>
            </div>
          </div>
          <Button variant="primary" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
            Sign Out
          </Button>
        </div>

        <div className="flex gap-stack-lg">
          <aside className="hidden w-56 shrink-0 md:block">
            <nav className="flex flex-col gap-1">
              {superAdminTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-body-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}>
                  <Icon name={tab.icon} className="text-lg" />{tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="mb-stack-lg flex flex-wrap gap-1 overflow-x-auto border-b border-slate-200 md:hidden">
            {superAdminTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-body-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'border-blue-600 font-semibold text-blue-700' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 pb-stack-xl">
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
