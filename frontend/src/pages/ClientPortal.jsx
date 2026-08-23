import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import { useAuth } from '../context/AuthContext.jsx';
import { clientPortalTabs } from '../data/portal.js';
import { fetchMyProfile, fetchMyProjects, fetchMyInvoices, fetchMyTickets, fetchMyPayments, fetchMyMeetings, fetchMyFiles, fetchMyReports, createTicket as createTicketApi } from '../api/clients.js';



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
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {[
     { label: 'Active Projects', value: activeProjects, icon: 'folder' },
     { label: 'Open Invoices', value: invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length, icon: 'receipt' },
     { label: 'Open Tickets', value: tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length, icon: 'support' },
     { label: 'Total Spend', value: `$${(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) / 1000).toFixed(0)}K`, icon: 'payments' },
    ].map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-white">{stat.label}</p>
     </div>
    ))}
   </div>
   <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
    <h3 className="mb-4 font-display text-headline-sm font-bold text-brand-dark dark:text-white">Profile</h3>
    <div className="grid gap-4 sm:grid-cols-2">
     {[
      { label: 'Company', value: profile.company_name },
      { label: 'Contact', value: profile.contact_name },
      { label: 'Email', value: profile.email },
      { label: 'Country', value: profile.country },
      { label: 'Industry', value: profile.industry },
     ].map((f) => (
      <div key={f.label}>
       <span className="font-label-caps text-label-caps font-semibold text-ink-muted dark:text-white">{f.label}</span>
       <p className="text-body-md font-semibold text-brand-dark dark:text-white">{f.value || '—'}</p>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}

function Projects({ projects }) {
 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   {projects.length === 0
    ? <div className="p-stack-lg"><EmptyState icon="folder" title="No projects yet" description="Your projects will appear here." /></div>
    : (
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
       <tr>
        <th className="px-stack-lg py-4">Project</th>
        <th className="px-stack-lg py-4">Progress</th>
        <th className="px-stack-lg py-4">Deadline</th>
        <th className="px-stack-lg py-4">Budget</th>
        <th className="px-stack-lg py-4">Status</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
       {projects.map((p) => (
        <tr key={p.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
         <td data-label="Project" className="px-stack-lg py-4 font-body text-body-md text-brand-dark dark:text-dark-brand">{p.title}</td>
         <td data-label="Progress" className="px-stack-lg py-4">
          <div className="flex items-center gap-3">
           <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-container">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.progress}%` }} />
           </div>
           <span className="text-body-sm text-ink-muted dark:text-white">{p.progress}%</span>
          </div>
         </td>
         <td data-label="Deadline" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.deadline}</td>
         <td data-label="Budget" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{p.budget}</td>
         <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[p.status] || 'neutral'}>{p.status.replace('_', ' ')}</StatusBadge></td>
        </tr>
       ))}
      </tbody>
     </table>
    )}
  </div>
 );
}

function Invoices({ invoices }) {
 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   {invoices.length === 0
    ? <div className="p-stack-lg"><EmptyState icon="receipt" title="No invoices yet" description="Your invoices will appear here." /></div>
    : (
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
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
        <tr key={inv.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
         <td data-label="Invoice" className="px-stack-lg py-4 font-body text-body-md text-brand-dark dark:text-dark-brand">{inv.id}</td>
         <td data-label="Amount" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">${inv.amount.toLocaleString()}</td>
         <td data-label="Issued" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{inv.issueDate}</td>
         <td data-label="Due" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{inv.dueDate}</td>
         <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[inv.status] || 'neutral'}>{inv.status}</StatusBadge></td>
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
 const [error, setError] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!newTicket.subject.trim()) return;
  setSubmitting(true);
  setError('');
  try {
   await onNewTicket(newTicket.subject, newTicket.description);
   setNewTicket({ subject: '', description: '' });
   setShowForm(false);
  } catch (err) {
   setError(err?.message || 'Could not submit the ticket. Please try again.');
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg">
     {error && (
      <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>
     )}
     <input type="text" placeholder="Subject" value={newTicket.subject}
      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
      className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink" />
     <textarea placeholder="Describe your issue..." value={newTicket.description}
      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
      rows={3} className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink" />
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
     </div>
    </form>
   )}
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    {tickets.length === 0
     ? <div className="p-stack-lg"><EmptyState icon="support" title="No tickets yet" description="Submit a ticket to get support." /></div>
     : (
      <table className="w-full text-left">
       <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
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
         <tr key={t.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
          <td data-label="ID" className="px-stack-lg py-4 font-label-caps text-label-caps text-brand">{t.id}</td>
          <td data-label="Subject" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">{t.subject}</td>
          <td data-label="Priority" className="px-stack-lg py-4"><Badge className="text-label-caps">{t.priority}</Badge></td>
          <td data-label="Created" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{t.createdAt}</td>
          <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[t.status] || 'neutral'}>{t.status}</StatusBadge></td>
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
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   {payments.length === 0
    ? <div className="p-stack-lg"><EmptyState icon="payments" title="No payments yet" description="Your payment history will appear here." /></div>
    : (
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
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
        <tr key={p.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
         <td data-label="Payment ID" className="px-stack-lg py-4 font-label-caps text-label-caps text-brand">{p.id}</td>
         <td data-label="Invoice" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.invoice}</td>
         <td data-label="Amount" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-dark-brand">${p.amount.toLocaleString()}</td>
         <td data-label="Method" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.method}</td>
         <td data-label="Date" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{p.date}</td>
         <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[p.status] || 'neutral'}>{p.status}</StatusBadge></td>
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
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   {files.length === 0
    ? <div className="p-stack-lg"><EmptyState icon="folder_open" title="No files yet" description="Shared files will appear here." /></div>
    : (
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
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
        <tr key={f.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
         <td data-label="Name" className="px-stack-lg py-4">
          <div className="flex items-center gap-2">
           <Icon name="description" className="text-lg text-brand" />
           <span className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{f.name}</span>
          </div>
         </td>
         <td data-label="Category" className="px-stack-lg py-4"><Badge className="text-label-caps">{f.category}</Badge></td>
         <td data-label="Size" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.size}</td>
         <td data-label="Uploaded" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.uploadedOn}</td>
         <td data-label="By" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.uploadedBy}</td>
         <td data-label="Name" className="px-stack-lg py-4">
          {f.file_url ? (
           <a href={f.file_url} target="_blank" rel="noreferrer" aria-label={`Open ${f.name}`} className="text-brand hover:text-brand-dark" title="Open file">
            <Icon name="open_in_new" className="text-xl" />
           </a>
          ) : (
           <span className="text-ink-muted/40" title="No file attached"><Icon name="open_in_new" className="text-xl" /></span>
          )}
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
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   {meetings.length === 0
    ? <div className="p-stack-lg"><EmptyState icon="video_call" title="No meetings scheduled" description="Upcoming meetings will appear here." /></div>
    : (
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
       <tr>
        <th className="px-stack-lg py-4">Meeting</th>
        <th className="px-stack-lg py-4">Date & Time</th>
        <th className="px-stack-lg py-4">Duration</th>
        <th className="px-stack-lg py-4">Attendees</th>
        <th className="px-stack-lg py-4">Status</th>
        <th className="px-stack-lg py-4">Action</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
       {meetings.map((m) => (
        <tr key={m.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
         <td data-label="Meeting" className="px-stack-lg py-4 font-body text-body-md text-brand-dark dark:text-dark-brand">{m.title}</td>
         <td data-label="Date & Time" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{m.date} {m.time}</td>
         <td data-label="Duration" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{m.duration}</td>
         <td data-label="Attendees" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-white">{(m.attendees ?? []).join(', ') || '—'}</td>
         <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={STATUS_VARIANTS[m.status] || 'neutral'}>{m.status}</StatusBadge></td>
         <td data-label="Action" className="px-stack-lg py-4">
          {m.status === 'upcoming' && m.meeting_link && (
           <a href={m.meeting_link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 rounded bg-brand px-3 py-1.5 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark">
            <Icon name="videocam" className="text-base" /> Join
           </a>
          )}
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    )}
  </div>
 );
}

function Reports({ reports }) {
 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   {reports.length === 0
    ? <div className="p-stack-lg"><EmptyState icon="bar_chart" title="No reports yet" description="Generated reports will appear here." /></div>
    : (
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
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
        <tr key={r.id} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
         <td data-label="Report" className="px-stack-lg py-4">
          <div className="flex items-center gap-2">
           <Icon name="bar_chart" className="text-lg text-brand" />
           <span className="text-body-md text-brand-dark dark:text-dark-brand">{r.title}</span>
          </div>
         </td>
         <td data-label="Type" className="px-stack-lg py-4"><Badge className="text-label-caps">{r.type}</Badge></td>
         <td data-label="Period" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{r.period}</td>
         <td data-label="Generated" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{r.generatedOn}</td>
         <td data-label="Size" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{r.size}</td>
         <td data-label="Report" className="px-stack-lg py-4">
          {r.file_url
           ? <a href={r.file_url} target="_blank" rel="noreferrer" aria-label={`Download ${r.title}`} className="text-brand hover:text-brand-dark"><Icon name="download" className="text-xl" /></a>
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

// ─── Data normalizers (map backend schema → portal UI shape) ─────────────────
const normalizeProject = (p) => ({
 id: p.id, title: p.title, status: p.status,
 progress: p.progress_percent ?? p.progress ?? 0,
 deadline: p.end_date ?? p.deadline ?? '—',
 budget: p.budget ? `$${Number(p.budget).toLocaleString()}` : 'TBD',
});
const normalizeProjects = (arr) => (Array.isArray(arr) ? arr.map(normalizeProject) : []);

const normalizeInvoice = (i) => ({
 id: i.invoice_number ?? i.id, amount: Number(i.total_amount ?? i.amount ?? 0),
 status: i.status, issueDate: i.issue_date ?? i.issueDate, dueDate: i.due_date ?? i.dueDate,
});
const normalizeInvoices = (arr) => (Array.isArray(arr) ? arr.map(normalizeInvoice) : []);

const normalizeTicket = (t) => ({
 id: t.ticket_number ?? t.id, subject: t.subject, status: t.status,
 priority: t.priority, createdAt: t.created_at?.slice(0, 10) ?? t.createdAt,
});
const normalizeTickets = (arr) => (Array.isArray(arr) ? arr.map(normalizeTicket) : []);

const normalizePayment = (p) => ({
 id: p.id, invoice: p.invoice_number ?? p.invoice ?? '—',
 amount: Number(p.amount ?? 0),
 method: (p.method ?? p.payment_method ?? '').replace('_', ' '),
 date: p.paid_at?.slice(0, 10) ?? p.date, status: p.status,
});
const normalizePayments = (arr) => (Array.isArray(arr) ? arr.map(normalizePayment) : []);

const normalizeMeeting = (m) => ({
 id: m.id, title: m.title,
 date: m.scheduled_at?.slice(0, 10) ?? m.date,
 time: m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (m.time ?? '—'),
 duration: m.duration_minutes ? `${m.duration_minutes} min` : (m.duration ?? '—'),
 type: m.meeting_link ? 'Video Call' : (m.type ?? 'On-site'),
 meeting_link: m.meeting_link,
 attendees: m.attendees ?? [],
 status: m.status === 'scheduled' ? 'upcoming' : (m.status ?? 'upcoming'),
});
const normalizeMeetings = (arr) => (Array.isArray(arr) ? arr.map(normalizeMeeting) : []);

const normalizeFile = (f) => ({
 id: f.id, name: f.name, category: f.category,
 size: f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : (f.size ?? '—'),
 uploadedOn: f.created_at?.slice(0, 10) ?? f.uploadedOn,
 uploadedBy: f.uploaded_by ?? f.uploadedBy ?? 'CoreFusion Team',
 file_url: f.file_url,
});
const normalizeFiles = (arr) => (Array.isArray(arr) ? arr.map(normalizeFile) : []);

const normalizeReport = (r) => ({
 id: r.id, title: r.title, type: r.report_type ?? r.type,
 period: r.period,
 generatedOn: r.created_at?.slice(0, 10) ?? r.generatedOn,
 size: r.size_bytes ? `${(r.size_bytes / 1024).toFixed(0)} KB` : (r.size ?? '—'),
 file_url: r.file_url,
});
const normalizeReports = (arr) => (Array.isArray(arr) ? arr.map(normalizeReport) : []);

export default function ClientPortal() {
 useDocumentTitle('Client Portal | CoreFusion Technologies');
 const { user, accessToken, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('client', '/login');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [loading, setLoading] = useState(true);
 const initialLoadDone = useRef(false);
 const [profile, setProfile] = useState({ contact_name: '', email: '', company_name: '', industry: '', country: '' });
 const [projects, setProjects] = useState([]);
 const [invoices, setInvoices] = useState([]);
 const [tickets, setTickets] = useState([]);
 const [payments, setPayments] = useState([]);
 const [files, setFiles] = useState([]);
 const [meetings, setMeetings] = useState([]);
 const [reports, setReports] = useState([]);

 useEffect(() => {
  if (!user || !accessToken) { setLoading(false); return; }
  if (!initialLoadDone.current) setLoading(true);
  Promise.allSettled([
   fetchMyProfile(accessToken).then((res) => res?.data),
   fetchMyProjects(accessToken).then((res) => res?.data),
   fetchMyInvoices(accessToken).then((res) => res?.data),
   fetchMyTickets(accessToken).then((res) => res?.data),
   fetchMyPayments(accessToken).then((res) => res?.data),
   fetchMyMeetings(accessToken).then((res) => res?.data),
   fetchMyFiles(accessToken).then((res) => res?.data),
   fetchMyReports(accessToken).then((res) => res?.data),
  ]).then(([p, pr, inv, t, pay, m, f, r]) => {
   if (p.status === 'fulfilled' && p.value) setProfile(p.value);
   if (pr.status === 'fulfilled' && pr.value) setProjects(normalizeProjects(pr.value));
   if (inv.status === 'fulfilled' && inv.value) setInvoices(normalizeInvoices(inv.value));
   if (t.status === 'fulfilled' && t.value) setTickets(normalizeTickets(t.value));
   if (pay.status === 'fulfilled' && pay.value) setPayments(normalizePayments(pay.value));
   if (m.status === 'fulfilled' && m.value) setMeetings(normalizeMeetings(m.value));
   if (f.status === 'fulfilled' && f.value) setFiles(normalizeFiles(f.value));
   if (r.status === 'fulfilled' && r.value) setReports(normalizeReports(r.value));
  }).finally(() => { initialLoadDone.current = true; setLoading(false); });
 }, [user, accessToken]);

 const fetchTab = async (tabId) => {
  if (!accessToken) return;
  const fetchers = {
   payments: () => fetchMyPayments(accessToken).then((res) => { if (res?.data) setPayments(normalizePayments(res.data)); }),
   files: () => fetchMyFiles(accessToken).then((res) => { if (res?.data) setFiles(normalizeFiles(res.data)); }),
   meetings: () => fetchMyMeetings(accessToken).then((res) => { if (res?.data) setMeetings(normalizeMeetings(res.data)); }),
   reports: () => fetchMyReports(accessToken).then((res) => { if (res?.data) setReports(normalizeReports(res.data)); }),
  };
  if (fetchers[tabId]) await fetchers[tabId]();
 };

 const handleTabChange = (tabId) => {
  setActiveTab(tabId);
  fetchTab(tabId);
 };

 const handleNewTicket = async (subject, description) => {
  if (!user || !accessToken) return;
  const res = await createTicketApi(accessToken, { subject, description: description || subject, priority: 'medium' });
  const d = res?.data;
  setTickets((prev) => [normalizeTicket(d), ...prev]);
 };

 // useRoleGuard already redirects both the unauthenticated case (to
 // /login?returnTo=..., preserving destination) and the wrong-role case —
 // no separate effect needed here. This gate just withholds rendering while
 // that redirect is in flight.
 if (initializing || !user || denied) return <div className="bg-surface-container py-section-padding dark:bg-dark-surface-container"><LoadingSpinner /></div>;
 if (loading) return <div className="bg-surface-container py-section-padding dark:bg-dark-surface-container"><LoadingSpinner /></div>;

 return (
  <div className="flex h-screen flex-col bg-surface-container dark:bg-dark-surface-container">
   <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-outline-variant bg-brand-dark px-4 py-3 sm:px-6 lg:px-10 xl:px-12 ">
    <div className="flex items-center gap-4">
     <Avatar name={profile.contact_name || 'Client'} size="lg" />
     <div>
      <h1 className="font-display text-headline-md font-bold text-white">{profile.contact_name || 'Client'}</h1>
      <p className="text-body-sm text-white/70">{profile.email || ''} &middot; {profile.company_name}</p>
     </div>
    </div>
    <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
     Sign Out
    </Button>
   </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-outline-variant bg-brand-dark md:block">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1 p-3">
      {clientPortalTabs.map((tab) => (
       <button key={tab.id} onClick={() => handleTabChange(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-colors ${
         activeTab === tab.id ? 'bg-brand/20 font-bold text-white' : 'text-white/70 hover:bg-white/15 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 flex-1 flex-col">
     <div role="tablist" aria-label="Portal navigation" className="mb-stack-lg flex flex-wrap gap-1 overflow-x-auto border-b border-outline-variant bg-brand-dark px-4 py-2 sm:px-6 md:hidden lg:px-10 xl:px-12">
      {clientPortalTabs.map((tab) => (
       <button key={tab.id} onClick={() => handleTabChange(tab.id)}
        className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
         activeTab === tab.id ? 'border-white font-bold text-white' : 'border-transparent font-semibold text-white/70 hover:border-white/40 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </div>

     <div className="min-w-0 flex-1 overflow-y-auto px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 ">
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
   </div>
  </div>
 );
}
