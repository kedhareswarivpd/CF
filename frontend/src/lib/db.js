import { supabase } from './supabase.js';

// ─── CLIENT PORTAL ────────────────────────────────────────────────────────────

export async function fetchClientProfile(userId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*, user:users(name, email)')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return {
    company_name: data.company_name,
    contact_name: data.user?.name,
    email: data.user?.email,
    country: data.country,
    industry: data.industry,
  };
}

export async function fetchClientProjects(userId) {
  // get client id first
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, status, progress_percent, end_date, budget')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    progress: p.progress_percent,
    deadline: p.end_date,
    budget: p.budget ? `$${Number(p.budget).toLocaleString()}` : 'TBD',
  }));
}

export async function fetchClientInvoices(userId) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_amount, issue_date, due_date, status')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('issue_date', { ascending: false });
  if (error) throw error;
  return data.map((inv) => ({
    id: inv.invoice_number,
    amount: Number(inv.total_amount),
    status: inv.status,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
  }));
}

export async function fetchClientTickets(userId) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('tickets')
    .select('id, ticket_number, subject, status, priority, created_at')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((t) => ({
    id: t.ticket_number,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    createdAt: t.created_at?.slice(0, 10),
  }));
}

export async function createTicket(userId, subject, description) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const ticketNumber = `TCK-${Date.now()}`;
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      client_id: client.id,
      ticket_number: ticketNumber,
      subject,
      description: description || subject,
      priority: 'medium',
      status: 'open',
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.ticket_number,
    subject: data.subject,
    status: data.status,
    priority: data.priority,
    createdAt: data.created_at?.slice(0, 10),
  };
}

export async function fetchClientPayments(userId) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('payments')
    .select('id, amount, method, transaction_ref, paid_at, status, invoice:invoices(invoice_number)')
    .eq('invoices.client_id', client.id)
    .is('deleted_at', null)
    .order('paid_at', { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    id: p.id,
    invoice: p.invoice?.invoice_number || '—',
    amount: Number(p.amount),
    method: p.method.replace('_', ' '),
    date: p.paid_at?.slice(0, 10),
    status: p.status,
  }));
}

export async function fetchClientMeetings(userId) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, scheduled_at, duration_minutes, meeting_link, status, agenda')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false });
  if (error) throw error;
  return data.map((m) => ({
    id: m.id,
    title: m.title,
    date: m.scheduled_at?.slice(0, 10),
    time: m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    duration: `${m.duration_minutes} min`,
    type: m.meeting_link ? 'Video Call' : 'On-site',
    attendees: [],
    status: m.status === 'scheduled' ? 'upcoming' : m.status,
  }));
}

export async function fetchClientFiles(userId) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('client_files')
    .select('id, name, category, file_url, size_bytes, uploaded_by, created_at')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    size: f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : '—',
    uploadedOn: f.created_at?.slice(0, 10),
    uploadedBy: f.uploaded_by || 'CoreFusion Team',
  }));
}

export async function fetchClientReports(userId) {
  const { data: client, error: ce } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (ce) throw ce;

  const { data, error } = await supabase
    .from('client_reports')
    .select('id, title, report_type, period, file_url, size_bytes, created_at')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.report_type,
    period: r.period,
    generatedOn: r.created_at?.slice(0, 10),
    size: r.size_bytes ? `${(r.size_bytes / 1024).toFixed(0)} KB` : '—',
  }));
}

// ─── EMPLOYEE PORTAL ──────────────────────────────────────────────────────────

export async function fetchEmployeeProfile(userId) {
  const { data, error } = await supabase
    .from('employees')
    .select('*, user:users(name, email, role), department:departments(name)')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return {
    _employeeId: data.id,
    employee_code: data.employee_code,
    name: data.user?.name,
    email: data.user?.email,
    role: data.user?.role,
    designation: data.designation,
    department: data.department?.name,
    status: data.status,
  };
}

export async function fetchEmployeeAttendance(employeeId) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { date: today, checkIn: null, checkOut: null, status: 'absent' };
  return {
    date: data.date,
    checkIn: data.check_in,
    checkOut: data.check_out,
    status: data.status,
  };
}

export async function checkInEmployee(employeeId) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 8);
  const { data, error } = await supabase
    .from('attendance')
    .upsert({ employee_id: employeeId, date: today, check_in: now, status: 'present' }, { onConflict: 'employee_id,date' })
    .select()
    .single();
  if (error) throw error;
  return { checkIn: data.check_in, checkOut: data.check_out, status: data.status };
}

export async function checkOutEmployee(employeeId) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 8);
  const { data, error } = await supabase
    .from('attendance')
    .update({ check_out: now })
    .eq('employee_id', employeeId)
    .eq('date', today)
    .select()
    .single();
  if (error) throw error;
  return { checkIn: data.check_in, checkOut: data.check_out, status: data.status };
}

export async function fetchEmployeeLeaves(employeeId) {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((l) => ({
    id: l.id,
    type: l.type,
    from: l.start_date,
    to: l.end_date,
    status: l.status,
    days: Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1,
  }));
}

export async function applyLeave(employeeId, type, from, to, reason) {
  const { data, error } = await supabase
    .from('leaves')
    .insert({ employee_id: employeeId, type: type.toLowerCase(), start_date: from, end_date: to, reason, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    type: data.type,
    from: data.start_date,
    to: data.end_date,
    status: data.status,
    days: Math.ceil((new Date(data.end_date) - new Date(data.start_date)) / 86400000) + 1,
  };
}

export async function fetchEmployeeTimesheets(employeeId) {
  const { data, error } = await supabase
    .from('timesheets')
    .select('*, project:projects(title)')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data.map((t) => ({
    id: t.id,
    date: t.date,
    project: t.project?.title || 'General',
    hours: Number(t.hours),
    description: t.description,
  }));
}

export async function logTimesheet(employeeId, date, projectName, hours, description) {
  // Try to find project by title
  let projectId = null;
  if (projectName) {
    const { data: proj } = await supabase.from('projects').select('id').ilike('title', projectName).maybeSingle();
    projectId = proj?.id || null;
  }
  const { data, error } = await supabase
    .from('timesheets')
    .insert({ employee_id: employeeId, project_id: projectId, date, hours, description, status: 'submitted' })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, date: data.date, project: projectName || 'General', hours: Number(data.hours), description: data.description };
}

export async function fetchEmployeePayslips(employeeId) {
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const { data, error } = await supabase
    .from('payslips')
    .select('*')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('year', { ascending: false })
    .order('month', { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    month: MONTH_NAMES[p.month - 1],
    year: p.year,
    grossPay: Number(p.basic) + Number(p.allowances),
    deductions: Number(p.deductions),
    netPay: Number(p.net_pay),
    status: p.status,
  }));
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

export async function fetchAdminKPIs() {
  const [
    { count: total_employees },
    { count: total_clients },
    { count: total_projects },
    { count: active_projects },
    { count: open_tasks },
    { count: open_tickets },
    { count: new_applications },
    { count: unresolved_contacts },
    { count: published_blogs },
  ] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('clients').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('projects').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress').is('deleted_at', null),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).not('status', 'eq', 'done').is('deleted_at', null),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open').is('deleted_at', null),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'applied').is('deleted_at', null),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new').is('deleted_at', null),
    supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null),
  ]);

  const { data: invoiceData } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('status', 'paid')
    .is('deleted_at', null);
  const total_revenue = (invoiceData || []).reduce((s, i) => s + Number(i.total_amount), 0);

  return { total_employees, total_clients, total_projects, active_projects, open_tasks, open_tickets, new_applications, unresolved_contacts, published_blogs, total_revenue };
}

export async function fetchProjectStatusBreakdown() {
  const statuses = ['planning', 'in_progress', 'on_hold', 'completed'];
  const results = await Promise.all(
    statuses.map((s) =>
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', s).is('deleted_at', null)
        .then(({ count }) => ({ status: s, count: count || 0 }))
    )
  );
  return results;
}
