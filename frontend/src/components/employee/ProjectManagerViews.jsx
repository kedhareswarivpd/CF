import { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import RowAction from '../ui/RowAction.jsx';
import Pagination from '../ui/Pagination.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import { FORM_INPUT_CLASS } from '../ui/formClasses.js';
import useAsyncAction from '../../hooks/useAsyncAction.js';
import {
 fetchAllTimesheets, reviewTimesheet,
 fetchTasks, createTask, updateTaskStatus,
 assignProjectTeam, fetchAdminProjects, createProject,
 fetchEmployees, fetchClients, submitProjectForClientReview,
} from '../../api/admin.js';
import { validateAddProject } from '../../schemas/project.schema.js';
import { validateNewTask } from '../../schemas/task.schema.js';

const PROJECT_STATUS_COLOR = { planning: 'neutral', in_progress: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error' };
const TASK_STATUS_COLUMNS = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];
const TASK_PRIORITY_COLOR = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'error' };
const TIMESHEET_STATUS_COLOR = { draft: 'neutral', submitted: 'warning', approved: 'success', rejected: 'error' };

// ---------- Project Manager ----------
function TeamProjects({ userId }) {
 const [projects, setProjects] = useState([]);
 const [employees, setEmployees] = useState([]);
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ title: '', client_id: '', budget: '', start_date: '', end_date: '' });
 const [fieldErrors, setFieldErrors] = useState({});
 const [assigningId, setAssigningId] = useState(null);
 const [teamSelection, setTeamSelection] = useState([]);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run: runAssign, isPending: assignPending } = useAsyncAction();
 const { run: runCreate, isPending: creating } = useAsyncAction();
 const { run: runSubmitReview, isPending: submittingReview } = useAsyncAction();

 const showToast = (msg, type = 'success') => {
  setToast({ msg, type });
  setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
 };

 const load = useCallback(() => {
  if (!userId) { setLoading(false); return; }
  setLoading(true);
  Promise.allSettled([
   fetchAdminProjects({ project_manager_id: userId, page, limit: 20 }),
   fetchEmployees({ limit: 100 }),
   fetchClients({ limit: 100 }),
  ]).then(([p, e, c]) => {
   if (p.status === 'fulfilled') {
    setProjects(p.value?.data || []);
    setTotalPages(p.value?.meta?.total_pages || 1);
   }
   if (e.status === 'fulfilled') setEmployees(e.value?.data || []);
   if (c.status === 'fulfilled') setClients(c.value?.data || []);
  }).finally(() => setLoading(false));
 }, [userId, page]);

 useEffect(() => { load();  }, [load]);

 const clientName = (id) => clients.find((c) => c.id === id)?.company_name || '—';

 const handleCreate = (e) => {
  e.preventDefault();
  const clientErrors = validateAddProject({ ...form, status: 'planning' });
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   showToast('Please fix the errors below.', 'error');
   return;
  }
  setFieldErrors({});
  runCreate(async () => {
   try {
    await createProject({
     title: form.title,
     client_id: form.client_id || null,
     budget: form.budget ? Number(form.budget) : null,
     start_date: form.start_date || null,
     end_date: form.end_date || null,
     project_manager_id: userId,
    });
    setForm({ title: '', client_id: '', budget: '', start_date: '', end_date: '' });
    setShowForm(false);
    showToast('Project created successfully');
    load();
   } catch (err) {
    showToast(err?.message || 'Failed to create project', 'error');
   }
  });
 };

 const startAssign = (project) => {
  setAssigningId(project.id);
  const currentMemberIds = (project.team || []).map((m) => m.id);
  setTeamSelection(currentMemberIds);
 };

 const toggleTeamMember = (id) => setTeamSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

 const submitAssign = () => runAssign(async () => {
  try {
   await assignProjectTeam(assigningId, teamSelection);
   showToast('Team is assigned');
   setAssigningId(null);
   load();
  } catch (err) {
   showToast(err?.message || 'Failed to assign team', 'error');
  }
 });

 const submitForReview = (project) => runSubmitReview(async () => {
  try {
   await submitProjectForClientReview(project.id);
   showToast('Submitted for client review — the client has been notified.');
   load();
  } catch (err) {
   showToast(err?.message || 'Failed to submit for client review', 'error');
  }
 });

 if (loading) return <SkeletonTable rows={6} columns={4} />;

 return (
  <div className="space-y-stack-md">
   {toast.msg && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.type === 'success' ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast.msg}</p>
   )}

   <div className="flex justify-end">
    <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>New Project</Button>
   </div>
   {showForm && (
    <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-2">
      <div>
       <input required type="text" placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${FORM_INPUT_CLASS} w-full`} />
       {fieldErrors.title && <p className="mt-1 text-body-xs text-status-error">{fieldErrors.title}</p>}
      </div>
      <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={FORM_INPUT_CLASS}>
       <option value="">No client yet</option>
       {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.id}</option>)}
      </select>
      <div>
       <input type="number" min="0" placeholder="Budget ($)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={`${FORM_INPUT_CLASS} w-full`} />
       {fieldErrors.budget && <p className="mt-1 text-body-xs text-status-error">{fieldErrors.budget}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
       <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={FORM_INPUT_CLASS} />
       <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={FORM_INPUT_CLASS} />
      </div>
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
     </div>
    </form>
   )}

   <div className="space-y-4">
    {projects.map((p) => (
     <div key={p.id} className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-3 flex items-start justify-between gap-4">
       <div>
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-white">{p.title}</h3>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Client: {clientName(p.client_id)}{p.budget ? ` · Budget: $${Number(p.budget).toLocaleString()}` : ''}</p>
       </div>
       <StatusBadge variant={PROJECT_STATUS_COLOR[p.status]}>{p.status?.replace('_', ' ')}</StatusBadge>
      </div>
      <div className="mb-3 flex items-center gap-3">
       <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-container">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.progress_percent}%` }} />
       </div>
       <span className="w-10 text-right text-body-sm font-semibold text-brand-dark dark:text-white">{p.progress_percent}%</span>
      </div>

      {p.status === 'completed' && !p.completion_submitted_at && (
       <div className="mb-3 flex items-center justify-between rounded-lg border border-green-500/30 bg-status-success-bg0/10 px-4 py-2">
        <span className="text-body-sm text-status-success-text">All tasks done — ready to submit for client review.</span>
        <RowAction disabled={submittingReview} onClick={() => submitForReview(p)}>
         {submittingReview ? 'Submitting...' : 'Submit for Client Review'}
        </RowAction>
       </div>
      )}
      {p.completion_submitted_at && (
       <p className="mb-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">Submitted for client review on {new Date(p.completion_submitted_at).toLocaleDateString()} — {p.client_review_status || 'pending'}.</p>
      )}

      {/* Display assigned team members if any */}
      {(p.team && p.team.length > 0 && assigningId !== p.id) && (
       <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-label-caps text-body-xs uppercase text-ink-muted dark:text-dark-ink-muted">Team:</span>
        {p.team.map((m) => (
         <span key={m.id} className="inline-flex items-center rounded-full border border-blue-200 bg-accent-cyan-pale px-2.5 py-0.5 text-body-xs font-medium text-brand dark:bg-blue-900/30">
          {m.employee_code || 'EMP'}{m.designation ? ` · ${m.designation}` : ''}
         </span>
        ))}
       </div>
      )}

      {assigningId === p.id ? (
       <div className="space-y-3 border-t border-outline-variant pt-3 dark:border-dark-outline-variant">
        <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Select team members</p>
        <div className="flex flex-wrap gap-2">
         {employees.map((emp) => (
          <button key={emp.id} type="button" onClick={() => toggleTeamMember(emp.id)}
           className={`rounded-lg border px-3 py-1.5 text-body-sm font-medium transition-colors ${teamSelection.includes(emp.id) ? 'border-brand bg-brand text-white shadow-sm' : 'border-outline-variant bg-white text-ink hover:border-brand dark:border-dark-outline-variant dark:text-white'}`}>
           {emp.employee_code}{emp.designation ? ` · ${emp.designation}` : ''}
          </button>
         ))}
        </div>
        <div className="flex gap-2">
         <RowAction disabled={assignPending} onClick={submitAssign}>{assignPending ? 'Saving...' : 'Save Team'}</RowAction>
         <RowAction variant="outline" disabled={assignPending} onClick={() => setAssigningId(null)}>Cancel</RowAction>
        </div>
       </div>
      ) : (
       <RowAction onClick={() => startAssign(p)}>
        {p.team && p.team.length > 0 ? 'Edit Team' : 'Assign Team'}
       </RowAction>
      )}
     </div>
    ))}
    {!projects.length && <p className="py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No projects assigned to you yet.</p>}
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function TaskBoard({ userId }) {
 const [projects, setProjects] = useState([]);
 const [employees, setEmployees] = useState([]);
 const [selectedProject, setSelectedProject] = useState('');
 const [tasks, setTasks] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', assigned_to: '' });
 const [fieldErrors, setFieldErrors] = useState({});
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run: runCreate, isPending: creating } = useAsyncAction();
 const { run: runChangeStatus, isPending: changingStatus } = useAsyncAction();

 const showToast = (msg, type = 'success') => {
  setToast({ msg, type });
  setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
 };

 useEffect(() => {
  if (!userId) { setLoading(false); return; }
  Promise.allSettled([
   fetchAdminProjects({ project_manager_id: userId, limit: 100 }),
   fetchEmployees({ limit: 100 }),
  ]).then(([pRes, eRes]) => {
   const pItems = pRes.status === 'fulfilled' ? pRes.value?.data || [] : [];
   const eItems = eRes.status === 'fulfilled' ? eRes.value?.data || [] : [];
   setProjects(pItems);
   setEmployees(eItems);
   setSelectedProject((prev) => prev || pItems[0]?.id || '');
  }).catch(() => {});
 }, [userId]);

 const loadTasks = useCallback(() => {
  if (!selectedProject) { setLoading(false); return; }
  setLoading(true);
  fetchTasks({ project_id: selectedProject, page, limit: 20 })
   .then((r) => { setTasks(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [selectedProject, page]);

 useEffect(() => { loadTasks(); }, [loadTasks]);

 // Switching projects must not leave the board on a page number that
 // doesn't exist for the newly-selected project's task list.
 useEffect(() => { setPage(1); }, [selectedProject]);

 const handleCreate = (e) => {
  e.preventDefault();
  if (!selectedProject) return;
  const clientErrors = validateNewTask(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   return;
  }
  setFieldErrors({});
  runCreate(async () => {
   try {
    await createTask({
     project_id: selectedProject,
     title: form.title,
     priority: form.priority,
     assigned_to: form.assigned_to || null,
     due_date: form.due_date || null,
    });
    setForm({ title: '', priority: 'medium', due_date: '', assigned_to: '' });
    setShowForm(false);
    showToast('Task created successfully');
    loadTasks();
   } catch (err) {
    showToast(err?.message || 'Failed to create task', 'error');
   }
  });
 };

 const changeStatus = (taskId, status) => runChangeStatus(async () => {
  try {
   await updateTaskStatus(taskId, status);
   showToast(`Task moved to ${status.replace('_', ' ')}`);
   loadTasks();
  } catch (err) {
   showToast(err?.message || 'Failed to update task', 'error');
  }
 });

 const assigneeLabel = (assignedUserId) => {
  if (!assignedUserId) return null;
  const emp = employees.find((e) => e.user_id === assignedUserId);
  return emp ? `${emp.employee_code}${emp.designation ? ` · ${emp.designation}` : ''}` : 'Assigned';
 };

 const activeProjectTitle = projects.find((p) => p.id === selectedProject)?.title || 'Project';

 return (
  <div className="space-y-stack-md">
   {toast.msg && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.type === 'success' ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast.msg}</p>
   )}

   <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-white p-4 shadow-sm dark:border-dark-outline-variant">
    <div className="flex items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Project:</span>
     <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md font-semibold text-brand-dark focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white">
      {!projects.length && <option value="">No projects</option>}
      {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
     </select>
    </div>
    <Button variant="primary" size="md" icon={<Icon name="add" />} disabled={!selectedProject} onClick={() => setShowForm((v) => !v)}>
     New Task
    </Button>
   </div>

   {showForm && (
    <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant">
     <h4 className="font-display text-body-lg font-bold text-brand-dark dark:text-white">Add Task to {activeProjectTitle}</h4>
     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
       <input required type="text" placeholder="Task title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${FORM_INPUT_CLASS} w-full`} />
       {fieldErrors.title && <p className="mt-1 text-body-xs text-status-error">{fieldErrors.title}</p>}
      </div>
      <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className={FORM_INPUT_CLASS}>
       <option value="">Unassigned</option>
       {employees.filter((e) => e.user_id).map((e) => (
        <option key={e.id} value={e.user_id}>{e.employee_code} — {e.designation || 'Team Member'}</option>
       ))}
      </select>
      <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={FORM_INPUT_CLASS}>
       {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>Priority: {p.toUpperCase()}</option>)}
      </select>
      <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={FORM_INPUT_CLASS} />
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={creating}>{creating ? 'Creating...' : 'Add Task'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
     </div>
    </form>
   )}

   {loading ? <SkeletonTable rows={6} columns={4} /> : (
    <div className="grid gap-gutter md:grid-cols-4">
     {TASK_STATUS_COLUMNS.filter((c) => c !== 'blocked').map((col) => {
      const colTasks = tasks.filter((t) => t.status === col);
      return (
       <div key={col} className="space-y-3 rounded-xl border border-outline-variant bg-white p-4 shadow-sm dark:border-dark-outline-variant">
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2 dark:border-dark-outline-variant/50">
         <p className="font-label-caps text-label-caps font-bold uppercase text-ink dark:text-white">
          {col.replace('_', ' ')}
         </p>
         <span className="rounded-full bg-surface-container px-2 py-0.5 text-body-xs font-semibold text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">{colTasks.length}</span>
        </div>
        <div className="space-y-2.5">
         {colTasks.map((t) => (
          <div key={t.id} className="space-y-2 rounded-lg border border-outline-variant bg-surface-container p-3.5 shadow-sm transition-all hover:border-outline-variant hover:shadow dark:border-dark-outline-variant dark:bg-dark-surface-container">
           <div className="flex items-start justify-between gap-2">
            <p className="text-body-sm font-semibold leading-snug text-brand-dark dark:text-white">{t.title}</p>
            <StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
           </div>
           {assigneeLabel(t.assigned_to) && (
            <p className="flex items-center gap-1 text-body-xs text-ink-muted dark:text-dark-ink-muted">
             <Icon name="person" className="text-xs text-ink-muted dark:text-dark-ink-muted" />
             <span>{assigneeLabel(t.assigned_to)}</span>
            </p>
           )}
           {t.due_date && (
            <p className="flex items-center gap-1 text-body-xs text-ink-muted dark:text-dark-ink-muted">
             <Icon name="event" className="text-xs" />
             <span>Due: {t.due_date}</span>
            </p>
           )}
           <div className="pt-1">
            <select value={t.status} disabled={changingStatus} onChange={(e) => changeStatus(t.id, e.target.value)}
             className="w-full rounded border border-outline-variant bg-white px-2 py-1 text-body-xs font-medium text-ink focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white">
             {TASK_STATUS_COLUMNS.filter((c) => c !== 'blocked').map((s) => (
              <option key={s} value={s}>Move to: {s.replace('_', ' ').toUpperCase()}</option>
             ))}
            </select>
           </div>
          </div>
         ))}
         {!colTasks.length && (
          <div className="rounded-lg border border-dashed border-outline-variant py-6 text-center text-body-xs text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
           No tasks
          </div>
         )}
        </div>
       </div>
      );
     })}
    </div>
   )}

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Approvals() {
 const [timesheets, setTimesheets] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('submitted');
 const [toast, setToast] = useState('');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [submittedCount, setSubmittedCount] = useState(0);
 const [approvedCount, setApprovedCount] = useState(0);
 const [rejectedCount, setRejectedCount] = useState(0);
 const { run: runReview, isPending: reviewing } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const load = useCallback(() => {
  setLoading(true);
  const params = { page, limit: 20 };
  if (filter !== 'all') params.status = filter;
  Promise.allSettled([
   fetchAllTimesheets(params),
   fetchAllTimesheets({ limit: 1, status: 'submitted' }),
   fetchAllTimesheets({ limit: 1, status: 'approved' }),
   fetchAllTimesheets({ limit: 1, status: 'rejected' }),
  ]).then(([listRes, submittedRes, approvedRes, rejectedRes]) => {
   if (listRes.status === 'fulfilled') {
    setTimesheets(listRes.value?.data || []);
    setTotalPages(listRes.value?.meta?.total_pages || 1);
   }
   if (submittedRes.status === 'fulfilled') setSubmittedCount(submittedRes.value?.meta?.total || 0);
   if (approvedRes.status === 'fulfilled') setApprovedCount(approvedRes.value?.meta?.total || 0);
   if (rejectedRes.status === 'fulfilled') setRejectedCount(rejectedRes.value?.meta?.total || 0);
  }).finally(() => setLoading(false));
 }, [filter, page]);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
  const id = setInterval(load, 30000);
  return () => clearInterval(id);
 }, [load]);

 // Changing the status filter must not leave the view on a page number
 // that no longer exists in the filtered result set.
 useEffect(() => { setPage(1); }, [filter]);

 const review = (id, status) => runReview(async () => {
  try {
   await reviewTimesheet(id, status);
   showToast(`Timesheet ${status}.`);
   load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  }
 });

 const visible = timesheets;
 const kpis = [
  { label: 'Pending Approval', value: submittedCount, icon: 'pending_actions' },
  { label: 'Approved', value: approvedCount, icon: 'task_alt' },
  { label: 'Rejected', value: rejectedCount, icon: 'cancel' },
  { label: 'Total Entries', value: submittedCount + approvedCount + rejectedCount, icon: 'calendar_month' },
 ];

 if (loading) return <SkeletonTable rows={6} columns={6} />;
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
    {kpis.map((stat) => (
     <div key={stat.label} className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-2 flex items-center gap-3">
       <Icon name={stat.icon} className="text-2xl text-brand" />
       <span className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{stat.label}</span>
      </div>
      <p className="font-stat text-stat-lg text-brand-dark dark:text-white">{stat.value}</p>
     </div>
    ))}
   </div>

   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-brand-dark dark:text-white">Filter:</span>
     {['submitted', 'approved', 'rejected', 'all'].map((s) => (
      <button key={s} onClick={() => setFilter(s)}
       className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
        filter === s ? 'border-brand bg-brand text-white' : 'border-outline-variant text-ink-muted hover:border-brand hover:text-brand dark:border-dark-outline-variant dark:text-dark-ink-muted'
       }`}>{s}
      </button>
     ))}
    </div>
    <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-dark dark:text-white">
     <Icon name="refresh" className="text-base" /> Refresh
    </button>
   </div>

   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') || toast.includes('approved') || toast.includes('rejected')
      ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text'
      : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}

   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Employee</th>
       <th className="px-stack-lg py-4">Date</th>
       <th className="px-stack-lg py-4">Hours</th>
       <th className="px-stack-lg py-4">Description</th>
       <th className="px-stack-lg py-4">Status</th>
       <th className="px-stack-lg py-4">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {visible.map((t) => (
       <tr key={t.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Employee" className="px-stack-lg py-4">
         <p className="text-body-md font-semibold text-brand-dark dark:text-white">{t.employee_name || t.employee_code || '—'}</p>
         {t.employee_code && t.employee_name && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.employee_code}</p>}
        </td>
        <td data-label="Date" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.date}</td>
        <td data-label="Hours" className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-white">{t.hours}h</td>
        <td data-label="Description" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.description || '—'}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={TIMESHEET_STATUS_COLOR[t.status]}>{t.status}</StatusBadge></td>
        <td data-label="Actions" className="px-stack-lg py-4">
         <div className="flex gap-2">
          <RowAction disabled={reviewing} onClick={() => review(t.id, 'approved')}>Approve</RowAction>
          <RowAction variant="outline" disabled={reviewing} onClick={() => review(t.id, 'rejected')}>Reject</RowAction>
         </div>
        </td>
       </tr>
      ))}
      {!visible.length && <tr><td data-label="Employee" colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No timesheets to show.</td></tr>}
     </tbody>
    </table>
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}


export { TeamProjects, TaskBoard, Approvals };
