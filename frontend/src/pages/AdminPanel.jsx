import { useState, useEffect } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { adminPanelTabs, demoDashboard, demoProjectStatusBreakdown } from '../data/portal.js';
import { fetchAdminKPIs, fetchProjectStatusBreakdown } from '../lib/db.js';

const DEMO_EMAIL = 'admin@corefusiontech.com';
const DEMO_PASSWORD = 'ChangeMe@123';

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
            <Icon name="admin_panel_settings" className="text-white text-xl" />
          </div>
          <div>
            <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Admin Panel</h1>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Sign in to access the admin dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@corefusiontech.com"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </label>

          {error && (
            <p className="text-status-error-text text-body-sm flex items-center gap-1">
              <Icon name="error" className="text-base" />{error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand text-white h-11 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>


        </form>
      </div>
    </div>
  );
}

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

function UserManagement() {
  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        <div className="p-stack-lg border-b border-outline-variant dark:border-dark-outline-variant">
          <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">User Roles</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">
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

function EmployeeManagement() {
  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Employee Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-6">
          {[
            { label: 'Total', value: 285, color: 'text-brand' },
            { label: 'Active', value: 260, color: 'text-status-success-text' },
            { label: 'On Leave', value: 18, color: 'text-status-warning-text' },
            { label: 'New This Month', value: 7, color: 'text-status-info-text' },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 bg-surface-container dark:bg-dark-surface-container rounded-lg">
              <p className={`font-stat text-stat-lg ${s.color}`}>{s.value}</p>
              <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted border-b border-outline-variant dark:border-dark-outline-variant">
              <tr><th className="py-3 pr-4">Department</th><th className="py-3 pr-4">Headcount</th><th className="py-3 pr-4">Avg. Tenure</th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {[
                { dept: 'Engineering', headcount: 150, tenure: '2.5 yrs' },
                { dept: 'Data & AI', headcount: 35, tenure: '1.8 yrs' },
                { dept: 'Design', headcount: 20, tenure: '2.1 yrs' },
                { dept: 'Sales & Marketing', headcount: 30, tenure: '3.2 yrs' },
                { dept: 'HR & Admin', headcount: 15, tenure: '4.0 yrs' },
                { dept: 'Finance', headcount: 10, tenure: '3.5 yrs' },
                { dept: 'Security', headcount: 15, tenure: '2.0 yrs' },
                { dept: 'Operations', headcount: 10, tenure: '1.5 yrs' },
              ].map((d) => (
                <tr key={d.dept} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="py-3 pr-4 text-body-md text-brand-dark dark:text-dark-brand">{d.dept}</td>
                  <td className="py-3 pr-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{d.headcount}</td>
                  <td className="py-3 pr-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{d.tenure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientManagement() {
  return (
    <div className="space-y-stack-lg">
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Client Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-6">
          {[
            { label: 'Total Clients', value: 120, color: 'text-brand' },
            { label: 'Active Engagements', value: 85, color: 'text-status-success-text' },
            { label: 'New This Quarter', value: 12, color: 'text-status-info-text' },
            { label: 'At-Risk', value: 3, color: 'text-status-error-text' },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 bg-surface-container dark:bg-dark-surface-container rounded-lg">
              <p className={`font-stat text-stat-lg ${s.color}`}>{s.value}</p>
              <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted border-b border-outline-variant dark:border-dark-outline-variant">
              <tr><th className="py-3 pr-4">Industry</th><th className="py-3 pr-4">Clients</th><th className="py-3 pr-4">Revenue Share</th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {[
                { industry: 'Financial Services', clients: 28, revenue: '35%' },
                { industry: 'Healthcare', clients: 22, revenue: '20%' },
                { industry: 'Retail & E-commerce', clients: 18, revenue: '15%' },
                { industry: 'Logistics', clients: 15, revenue: '12%' },
                { industry: 'Manufacturing', clients: 12, revenue: '10%' },
                { industry: 'Government', clients: 10, revenue: '8%' },
              ].map((c) => (
                <tr key={c.industry} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="py-3 pr-4 text-body-md text-brand-dark dark:text-dark-brand">{c.industry}</td>
                  <td className="py-3 pr-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{c.clients}</td>
                  <td className="py-3 pr-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{c.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  useDocumentTitle('Admin Panel | CoreFusion Technologies');
  const { initializing } = useAuth();
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState(null);

  useEffect(() => {
    if (!adminAuthed) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      fetchAdminKPIs(),
      fetchProjectStatusBreakdown(),
    ]).then(([d, sb]) => {
      if (d.status === 'fulfilled') setKpis(d.value);
      if (sb.status === 'fulfilled') setStatusBreakdown(sb.value);
    }).finally(() => setLoading(false));
  }, [adminAuthed]);

  if (initializing) {
    return <div className="py-section-padding bg-surface-container"><LoadingSpinner /></div>;
  }

  if (!adminAuthed) {
    return <LoginGate onSuccess={() => setAdminAuthed(true)} />;
  }

  if (loading) {
    return <div className="py-section-padding bg-surface-container"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-section-padding bg-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name="Admin" size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">Admin Panel</h1>
              <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">System administration and management</p>
            </div>
          </div>
          <button
            onClick={() => setAdminAuthed(false)}
            className="border border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-brand hover:text-brand transition-all"
          >
            Sign Out
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-stack-lg border-b border-outline-variant dark:border-dark-outline-variant overflow-x-auto">
          {adminPanelTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-brand dark:text-dark-brand border-brand dark:border-dark-brand' : 'text-ink-muted dark:text-dark-ink-muted border-transparent dark:border-transparent hover:text-brand dark:hover:text-dark-brand'
              }`}>
              <Icon name={tab.icon} className="text-lg" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <Dashboard kpis={kpis} statusBreakdown={statusBreakdown} />}
        {activeTab === 'content' && <ContentManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'clients' && <ClientManagement />}
      </div>
    </div>
  );
}
