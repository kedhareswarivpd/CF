import { useState, useEffect } from 'react';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { clientPortalTabs, demoClientProfile, demoClientProjects, demoClientInvoices, demoClientTickets, demoClientPayments, demoClientFiles, demoClientMeetings, demoClientReports } from '../data/portal.js';
import { fetchClientProfile, fetchClientProjects, fetchClientInvoices, fetchClientTickets, fetchClientPayments, fetchClientMeetings, fetchClientFiles, fetchClientReports } from '../lib/db.js';
import { apiRequest } from '../api/client.js';
import { loginToPortal } from '../lib/portalAuth.js';

const CLIENT_PORTAL_ROLES = ['client'];

const STATUS_VARIANTS = {
  in_progress: 'info', completed: 'success', planning: 'warning', on_hold: 'neutral',
  paid: 'success', pending: 'warning', overdue: 'error', sent: 'info', draft: 'neutral',
  open: 'info', resolved: 'success', closed: 'neutral', cancelled: 'error',
  upcoming: 'info',
  project: 'info', financial: 'warning', annual: 'neutral',
};

function Overview({ profile, projects, invoices, tickets }) {
  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
  return (
    <div className="space-y-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[
          { label: 'Active Projects', value: activeProjects, icon: 'folder' },
          { label: 'Open Invoices', value: invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length, icon: 'receipt' },
          { label: 'Open Tickets', value: tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length, icon: 'support' },
          { label: 'Total Spend', value: `$${(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) / 1000).toFixed(0)}K`, icon: 'payments' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <div className="flex items-center gap-3 mb-2">
              <Icon name={stat.icon} className="text-brand text-2xl" />
              <span className="font-label-caps text-label-caps text-ink-muted dark:text-white font-semibold">{stat.label}</span>
            </div>
            <p className="font-stat text-stat-lg text-brand-dark dark:text-white font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-white font-bold mb-4">Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Company', value: profile.company_name },
            { label: 'Contact', value: profile.contact_name },
            { label: 'Email', value: profile.email },
            { label: 'Country', value: profile.country },
            { label: 'Industry', value: profile.industry },
          ].map((f) => (
            <div key={f.label}>
              <span className="font-label-caps text-label-caps text-ink-muted dark:text-white font-semibold">{f.label}</span>
              <p className="text-body-md text-brand-dark dark:text-white font-semibold">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Projects({ projects }) {
  return (
    <div className="space-y-stack-md">
      {projects.length === 0 && <EmptyState icon="folder" title="No projects yet" description="Your projects will appear here." />}
      {projects.map((p) => (
        <div key={p.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{p.title}</h3>
            <StatusBadge variant={STATUS_VARIANTS[p.status] || 'neutral'} className="whitespace-nowrap">{p.status.replace('_', ' ')}</StatusBadge>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-body-sm text-ink-muted dark:text-white mb-4">
            <div>
              <span className="font-label-caps text-label-caps">Progress</span>
              <div className="w-full h-2 bg-surface-container dark:bg-dark-surface-container rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="text-body-sm">{p.progress}%</span>
            </div>
            <div><span className="font-label-caps text-label-caps">Deadline</span><p>{p.deadline}</p></div>
            <div><span className="font-label-caps text-label-caps">Budget</span><p>{p.budget}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Invoices({ invoices }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      {invoices.length === 0
        ? <div className="p-stack-lg"><EmptyState icon="receipt" title="No invoices yet" description="Your invoices will appear here." /></div>
        : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr>
                <th className="px-stack-lg py-4">Invoice</th>
                <th className="px-stack-lg py-4">Amount</th>
                <th className="px-stack-lg py-4">Issued</th>
                <th className="px-stack-lg py-4">Due</th>
                <th className="px-stack-lg py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4 font-body text-body-md text-brand-dark dark:text-dark-brand">{inv.id}</td>
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">${inv.amount.toLocaleString()}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{inv.issueDate}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{inv.dueDate}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[inv.status] || 'neutral'}>{inv.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

function Tickets({ tickets, onNewTicket }) {
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim()) return;
    setSubmitting(true);
    try {
      await onNewTicket(newTicket.subject, newTicket.description);
      setNewTicket({ subject: '', description: '' });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-stack-md">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="md" icon={<Icon name="add" />}>New Ticket</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-lg p-stack-lg space-y-4">
          <input type="text" placeholder="Subject" value={newTicket.subject}
            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            className="w-full border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
          <textarea placeholder="Describe your issue..." value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            rows={3} className="w-full border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand" />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
        {tickets.length === 0
          ? <div className="p-stack-lg"><EmptyState icon="support" title="No tickets yet" description="Submit a ticket to get support." /></div>
          : (
            <table className="w-full text-left">
              <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
                <tr>
                  <th className="px-stack-lg py-4">ID</th>
                  <th className="px-stack-lg py-4">Subject</th>
                  <th className="px-stack-lg py-4">Priority</th>
                  <th className="px-stack-lg py-4">Created</th>
                  <th className="px-stack-lg py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                    <td className="px-stack-lg py-4 font-label-caps text-label-caps text-brand">{t.id}</td>
                    <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{t.subject}</td>
                    <td className="px-stack-lg py-4"><Badge className="text-label-caps">{t.priority}</Badge></td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{t.createdAt}</td>
                    <td className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[t.status] || 'neutral'}>{t.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

function Payments({ payments }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      {payments.length === 0
        ? <div className="p-stack-lg"><EmptyState icon="payments" title="No payments yet" description="Your payment history will appear here." /></div>
        : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr>
                <th className="px-stack-lg py-4">Payment ID</th>
                <th className="px-stack-lg py-4">Invoice</th>
                <th className="px-stack-lg py-4">Amount</th>
                <th className="px-stack-lg py-4">Method</th>
                <th className="px-stack-lg py-4">Date</th>
                <th className="px-stack-lg py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4 font-label-caps text-label-caps text-brand">{p.id}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.invoice}</td>
                  <td className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">${p.amount.toLocaleString()}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.method}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.date}</td>
                  <td className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[p.status] || 'neutral'}>{p.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

function Files({ files }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      {files.length === 0
        ? <div className="p-stack-lg"><EmptyState icon="folder_open" title="No files yet" description="Shared files will appear here." /></div>
        : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr>
                <th className="px-stack-lg py-4">Name</th>
                <th className="px-stack-lg py-4">Category</th>
                <th className="px-stack-lg py-4">Size</th>
                <th className="px-stack-lg py-4">Uploaded</th>
                <th className="px-stack-lg py-4">By</th>
                <th className="px-stack-lg py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {files.map((f) => (
                <tr key={f.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4">
                    <div className="flex items-center gap-2">
                      <Icon name="description" className="text-brand text-lg" />
                      <span className="text-body-md text-brand-dark dark:text-dark-brand">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-stack-lg py-4"><Badge className="text-label-caps">{f.category}</Badge></td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.size}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.uploadedOn}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.uploadedBy}</td>
                  <td className="px-stack-lg py-4">
                    {f.file_url
                      ? <a href={f.file_url} target="_blank" rel="noreferrer" className="text-brand hover:text-brand-dark"><Icon name="download" className="text-xl" /></a>
                      : <span className="text-ink-muted/40"><Icon name="download" className="text-xl" /></span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

function Meetings({ meetings }) {
  return (
    <div className="space-y-stack-md">
      {meetings.length === 0 && <EmptyState icon="video_call" title="No meetings scheduled" description="Upcoming meetings will appear here." />}
      {meetings.map((m) => (
        <div key={m.id} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <Icon name="video_call" className="text-brand text-2xl" />
              <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{m.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge variant={STATUS_VARIANTS[m.status] || 'neutral'}>{m.status}</StatusBadge>
              {m.status === 'upcoming' && m.meeting_link && (
                <a href={m.meeting_link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 bg-brand text-white px-3 py-1.5 rounded font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-colors">
                  <Icon name="videocam" className="text-base" /> Join
                </a>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-4 text-body-sm text-ink-muted dark:text-white">
            <div><span className="font-label-caps text-label-caps block">Date</span>{m.date}</div>
            <div><span className="font-label-caps text-label-caps block">Time</span>{m.time}</div>
            <div><span className="font-label-caps text-label-caps block">Duration</span>{m.duration}</div>
            <div><span className="font-label-caps text-label-caps block">Type</span>{m.type}</div>
          </div>
          <div className="mt-3">
            <span className="font-label-caps text-label-caps text-ink-muted dark:text-white">Attendees: </span>
            <span className="text-body-sm text-ink-muted dark:text-white">{m.attendees.join(', ')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Reports({ reports }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
      {reports.length === 0
        ? <div className="p-stack-lg"><EmptyState icon="bar_chart" title="No reports yet" description="Generated reports will appear here." /></div>
        : (
          <table className="w-full text-left">
            <thead className="bg-surface-container dark:bg-dark-surface-container font-label-caps text-label-caps uppercase text-white/70">
              <tr>
                <th className="px-stack-lg py-4">Report</th>
                <th className="px-stack-lg py-4">Type</th>
                <th className="px-stack-lg py-4">Period</th>
                <th className="px-stack-lg py-4">Generated</th>
                <th className="px-stack-lg py-4">Size</th>
                <th className="px-stack-lg py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors">
                  <td className="px-stack-lg py-4">
                    <div className="flex items-center gap-2">
                      <Icon name="bar_chart" className="text-brand text-lg" />
                      <span className="text-body-md text-brand-dark dark:text-dark-brand">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-stack-lg py-4"><Badge className="text-label-caps">{r.type}</Badge></td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{r.period}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{r.generatedOn}</td>
                  <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{r.size}</td>
                  <td className="px-stack-lg py-4">
                    {r.file_url
                      ? <a href={r.file_url} target="_blank" rel="noreferrer" className="text-brand hover:text-brand-dark"><Icon name="download" className="text-xl" /></a>
                      : <span className="text-ink-muted/40"><Icon name="download" className="text-xl" /></span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
      await loginToPortal(login, email, password, CLIENT_PORTAL_ROLES);
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
            <Icon name="lock" className="text-white text-xl" />
          </div>
          <div>
            <h1 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Client Portal</h1>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Sign in to access your account</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="flex flex-col gap-1.5">
            <span className="font-label-caps text-label-caps uppercase text-ink-muted">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
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
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted text-center">
            Don't have an account?{' '}<a href="/register" className="text-brand hover:underline font-semibold">Create account</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ClientPortal() {
  useDocumentTitle('Client Portal | CoreFusion Technologies');
  const { user, accessToken, initializing, logout } = useAuth();
  const [clientAuthed, setClientAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(demoClientProfile);
  const [projects, setProjects] = useState(demoClientProjects);
  const [invoices, setInvoices] = useState(demoClientInvoices);
  const [tickets, setTickets] = useState(demoClientTickets);
  const [payments, setPayments] = useState(demoClientPayments);
  const [files, setFiles] = useState(demoClientFiles);
  const [meetings, setMeetings] = useState(demoClientMeetings);
  const [reports, setReports] = useState(demoClientReports);

  useEffect(() => {
    if (!clientAuthed || !user) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      fetchClientProfile(user.id),
      fetchClientProjects(user.id),
      fetchClientInvoices(user.id),
      fetchClientTickets(user.id),
      fetchClientPayments(user.id),
      fetchClientMeetings(user.id),
      fetchClientFiles(user.id),
      fetchClientReports(user.id),
    ]).then(([p, pr, inv, t, pay, mtg, fil, rep]) => {
      if (p.status === 'fulfilled') setProfile(p.value);
      if (pr.status === 'fulfilled') setProjects(pr.value);
      if (inv.status === 'fulfilled') setInvoices(inv.value);
      if (t.status === 'fulfilled') setTickets(t.value);
      if (pay.status === 'fulfilled') setPayments(pay.value);
      if (mtg.status === 'fulfilled') setMeetings(mtg.value);
      if (fil.status === 'fulfilled') setFiles(fil.value);
      if (rep.status === 'fulfilled') setReports(rep.value);
    }).finally(() => setLoading(false));
  }, [clientAuthed, user]);

  const handleNewTicket = async (subject, description) => {
    if (!user) return;
    try {
      if (accessToken) {
        // Use backend API so support team sees it immediately
        const res = await apiRequest('/tickets', {
          method: 'POST',
          token: accessToken,
          body: { subject, description: description || subject, priority: 'medium' },
        });
        const d = res?.data;
        setTickets((prev) => [{ id: d.ticket_number, subject: d.subject, status: d.status, priority: d.priority, createdAt: d.created_at?.slice(0, 10) }, ...prev]);
      } else {
        // Fallback: Supabase direct
        const { createTicket: createTicketDirect } = await import('../lib/db.js');
        const ticket = await createTicketDirect(user.id, subject, description);
        setTickets((prev) => [ticket, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  if (initializing) return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;
  if (!clientAuthed) return <LoginGate onSuccess={() => setClientAuthed(true)} />;
  if (loading) return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name={profile.contact_name || 'Client'} size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-white font-bold">Client Portal</h1>
              <p className="text-body-sm text-white/70 font-semibold">{profile.company_name}</p>
            </div>
          </div>
          <button onClick={() => { logout(); setClientAuthed(false); }} className="border border-white/40 text-white font-bold px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-brand hover:text-brand transition-all">
            Sign Out
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-stack-lg border-b border-white/20">
          {clientPortalTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors ${
                activeTab === tab.id ? 'text-white font-bold border-brand' : 'text-white/70 font-semibold border-transparent hover:text-white hover:border-white/40'
              }`}>
              <Icon name={tab.icon} className="text-lg" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <Overview profile={profile} projects={projects} invoices={invoices} tickets={tickets} />}
        {activeTab === 'projects' && <Projects projects={projects} />}
        {activeTab === 'invoices' && <Invoices invoices={invoices} />}
        {activeTab === 'payments' && <Payments payments={payments} />}
        {activeTab === 'files' && <Files files={files} />}
        {activeTab === 'meetings' && <Meetings meetings={meetings} />}
        {activeTab === 'reports' && <Reports reports={reports} />}
        {activeTab === 'tickets' && <Tickets tickets={tickets} onNewTicket={handleNewTicket} />}
      </div>
    </div>
  );
}
