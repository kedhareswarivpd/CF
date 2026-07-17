import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
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
import { fetchClientProjects, fetchClientInvoices, fetchClientTickets, fetchClientPayments, fetchClientMeetings, fetchClientFiles, fetchClientReports } from '../lib/db.js';
import { fetchMyProfile } from '../api/clients.js';
import { apiRequest } from '../api/client.js';



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

function getPreviewForFile(file) {
  const name = (file.name || '').toLowerCase();
  if (name.includes('pan card') || name.includes('pan number')) return PAN_CARD_PREVIEW;
  if (name.includes('aadhaar') || name.includes('aadhar')) return AADHAAR_PREVIEW;
  if (name.includes('offer letter')) return OFFER_LETTER_PREVIEW;
  if (name.includes('experience letter') || name.includes('experience cert')) return EXPERIENCE_LETTER_PREVIEW;
  if (name.includes('employment contract') || name.includes('employment agreement')) return CONTRACT_PREVIEW;
  if (name.includes('relieving letter') || name.includes('relieving')) return RELIEVING_LETTER_PREVIEW;
  if (name.includes('salary slip') || name.includes('salary statement') || name.includes('form 16')) return SALARY_SLIP_PREVIEW;
  if (name.includes('bank') && (name.includes('detail') || name.includes('statement') || name.includes('account'))) return BANK_DETAILS_PREVIEW;
  if (name.includes('address proof') || name.includes('utility bill') || name.includes('rent agreement')) return ADDRESS_PROOF_PREVIEW;
  if (name.includes('photo') || name.includes('passport size')) return PHOTO_PREVIEW;
  if (name.includes('proposal')) return PROPOSAL_PREVIEW;
  if (name.includes('srs') || name.includes('requirement')) return SRS_PREVIEW;
  if (name.includes('progress report') || name.includes('q2') || name.includes('status report')) return REPORT_PREVIEW;
  if (name.includes('nda') || name.includes('non-disclosure') || name.includes('confidential')) return NDA_PREVIEW;
  if (name.includes('api') || name.includes('integration') || name.includes('technical')) return API_GUIDE_PREVIEW;
  if (name.includes('payslip') || name.includes('pay slip') || name.includes('salary')) return PAYSLIP_PREVIEW;
  if (name.includes('invoice')) return INVOICE_PREVIEW;
  if (name.includes('policy') || name.includes('handbook')) return POLICY_PREVIEW;
  if (name.includes('certificate') || name.includes('completion')) return CERTIFICATE_PREVIEW;
  return null;
}

const PAN_CARD_PREVIEW = {
  sections: [
    { heading: 'PAN Card Details', content: 'Permanent Account Number (PAN) card details submitted for tax and compliance purposes. PAN is a 10-digit alphanumeric identifier issued by the Income Tax Department of India.' },
    { heading: 'PAN Information', table: { headers: ['Field', 'Details'], rows: [['PAN Number', 'ABCDE1234F'], ['Name on PAN', '[Employee Name]'], ['Date of Birth', '[DD/MM/YYYY]'], ['Father\'s Name', '[Father\'s Name]'], ['Address', '[Residential Address]'], ['PAN Type', 'Individual'], ['Issuing Authority', 'Income Tax Department, Govt. of India'], ['Date of Issue', '[DD/MM/YYYY]'], ['Validity', 'Lifetime (no expiry)']] } },
    { heading: 'Important Notes', content: 'PAN is mandatory for all financial transactions exceeding ₹50,000. It is required for TDS deduction on salary, income tax filing, and opening bank accounts. A copy of the PAN card is retained in employee records for compliance.' },
    { heading: 'Verification', content: 'PAN authenticity can be verified at https://www.incometax.gov.in/iec/foportal/ under "Verify Your PAN" service.' },
  ],
};

const AADHAAR_PREVIEW = {
  sections: [
    { heading: 'Aadhaar Card Details', content: 'Aadhaar is a 12-digit unique identity number issued by the Unique Identification Authority of India (UIDAI). It serves as proof of identity and address.' },
    { heading: 'Aadhaar Information', table: { headers: ['Field', 'Details'], rows: [['Aadhaar Number', 'XXXX XXXX 1234'], ['Name', '[Employee Name]'], ['Date of Birth', '[DD/MM/YYYY]'], ['Gender', '[Male/Female/Other]'], ['Address', '[Full residential address as per Aadhaar]'], ['Mobile Number', '[Registered mobile number]'], ['Email', '[Registered email]']] } },
    { heading: 'Privacy Notice', content: 'As per Supreme Court ruling, Aadhaar cannot be mandatorily produced for private employment. Submission is voluntary and used only for KYC verification. The last 4 digits are stored; full number is masked in all records.' },
  ],
};

const EXPERIENCE_LETTER_PREVIEW = {
  sections: [
    { heading: 'Experience Letter', content: 'This letter is issued to confirm the employment history and professional experience of the individual named below at CoreFusion Technologies Pvt. Ltd.' },
    { heading: 'To Whom It May Concern', content: 'This is to certify that [Employee Name] (Employee Code: CFT-XXXX) was employed with CoreFusion Technologies Pvt. Ltd. in the capacity of [Designation] from [Joining Date] to [Last Working Date]. During their tenure, they were associated with the [Department] team.' },
    { heading: 'Employment Details', table: { headers: ['Field', 'Details'], rows: [['Employee Code', 'CFT-XXXX'], ['Designation', '[Designation]'], ['Department', '[Department Name]'], ['Date of Joining', '[DD/MM/YYYY]'], ['Last Working Date', '[DD/MM/YYYY]'], ['Total Experience', '[X years, Y months]'], ['Reporting Manager', '[Manager Name]']] } },
    { heading: 'Roles & Responsibilities', content: 'During their employment, [Employee Name] was responsible for [brief description of key responsibilities]. They demonstrated strong technical skills, teamwork, and commitment to deliverables throughout their tenure.' },
    { heading: 'Reason for Separation', content: '[Resignation / End of Contract / Other — as applicable]' },
    { heading: 'Issued On', content: 'This letter is issued on request of the employee for whatever legal purpose it may serve. Date of Issue: [DD/MM/YYYY]. Place: Bangalore, India.' },
    { heading: 'Authorized Signatory', table: { headers: ['Field', 'Details'], rows: [['Name', 'Priya Mehta'], ['Title', 'HR Director'], ['Signature', '________________________'], ['Company Stamp', 'CoreFusion Technologies Pvt. Ltd.']] } },
  ],
};

const RELIEVING_LETTER_PREVIEW = {
  sections: [
    { heading: 'Relieving Letter', content: 'This letter confirms that the undersigned employee has been formally relieved of all duties and obligations upon completion of their notice period at CoreFusion Technologies Pvt. Ltd.' },
    { heading: 'Employee Details', table: { headers: ['Field', 'Details'], rows: [['Employee Name', '[Employee Name]'], ['Employee Code', 'CFT-XXXX'], ['Designation', '[Designation]'], ['Department', '[Department Name]'], ['Last Working Date', '[DD/MM/YYYY]'], ['Notice Period Served', '[1 month / 2 months]']] } },
    { heading: 'Clearance Confirmation', content: 'We confirm that [Employee Name] has completed all formalities including handover of company assets (laptop, ID card, access badges), pending assignments, and exit interview. All dues have been settled and the employee has no outstanding liabilities.' },
    { heading: 'Full and Final Settlement', table: { headers: ['Component', 'Amount (INR)', 'Status'], rows: [['Last Month Salary', '₹XX,XXX', 'Paid'], ['Leave Encashment', '₹XX,XXX', 'Paid'], ['Gratuity', '₹XX,XXX', 'Paid (if applicable)'], ['Bonus (Pro-rata)', '₹XX,XXX', 'Paid'], ['Deductions', '₹XX,XXX', 'Adjusted'], ['Net Settlement', '₹XX,XXX', 'Credited']] } },
    { heading: 'Issued On', content: 'We wish [Employee Name] all the best in their future endeavors. Date of Issue: [DD/MM/YYYY].' },
    { heading: 'Authorized Signatory', table: { headers: ['Field', 'Details'], rows: [['Name', 'Priya Mehta'], ['Title', 'HR Director'], ['Signature', '________________________'], ['Company Stamp', 'CoreFusion Technologies Pvt. Ltd.']] } },
  ],
};

const SALARY_SLIP_PREVIEW = {
  sections: [
    { heading: 'Form 16 — Tax Deducted at Source', content: 'Certificate under Section 203 of the Income Tax Act, 1961 for tax deducted at source on salary income.' },
    { heading: 'Employee & Employer Details', table: { headers: ['Field', 'Details'], rows: [['Employee Name', '[Employee Name]'], ['PAN', 'ABCDE1234F'], ['Assessment Year', '2026-27'], ['Period of Employment', 'Apr 2025 — Mar 2026'], ['Employer Name', 'CoreFusion Technologies Pvt. Ltd.'], ['Employer TAN', 'BLRD12345A'], ['Employer PAN', 'AABCC1234D']] } },
    { heading: 'Summary of Salary & Tax', table: { headers: ['Component', 'Amount (INR)'], rows: [['Gross Salary (Sec 17(1))', '₹18,00,000'], ['Allowances under Sec 10', '₹3,00,000'], ['Deductions under Sec 16', '₹50,000'], ['Income from Salary', '₹14,50,000'], ['Chapter VI-A Deductions', '₹1,50,000'], ['Taxable Income', '₹13,00,000'], ['Total TDS Deducted', '₹2,34,000'], ['TDS Deposited (Challan)', '₹2,34,000']] } },
    { heading: 'Verification', content: 'This is a system-generated Form 16. For any corrections, please contact the Finance team at finance@corefusiontech.com.' },
  ],
};

const BANK_DETAILS_PREVIEW = {
  sections: [
    { heading: 'Bank Account Details', content: 'Bank account information on file for salary credit and official payments. This information is confidential and restricted to authorized personnel only.' },
    { heading: 'Account Information', table: { headers: ['Field', 'Details'], rows: [['Account Holder Name', '[Employee Name]'], ['Bank Name', 'HDFC Bank Ltd.'], ['Account Number', '5010XXXX4821'], ['IFSC Code', 'HDFC0001234'], ['Branch', 'Koramangala, Bangalore'], ['Account Type', 'Savings'], ['Registered Mobile', '+91 XXXXX XXXXX'], ['PAN', 'ABCDE1234F']] } },
    { heading: 'Verification Status', table: { headers: ['Check', 'Status', 'Date'], rows: [['Account Name Match', 'Verified', '2026-01-15'], ['IFSC Validation', 'Verified', '2026-01-15'], ['Bank Confirmation', 'Verified', '2026-01-16'], ['NEFT/RTGS Eligible', 'Yes', '—']] } },
    { heading: 'Note', content: 'Salary is credited on the last working day of each month via NEFT. For any changes to bank details, please submit a request through the HR portal with a cancelled cheque leaf.' },
  ],
};

const ADDRESS_PROOF_PREVIEW = {
  sections: [
    { heading: 'Address Proof Document', content: 'Document submitted as proof of residential address for KYC and employee records. Accepted documents include utility bills, rental agreements, and government-issued address proof.' },
    { heading: 'Address on Record', table: { headers: ['Field', 'Details'], rows: [['Employee Name', '[Employee Name]'], ['Address Line 1', '[Flat/House No., Building]'], ['Address Line 2', '[Street, Locality]'], ['City', '[City]'], ['State', '[State]'], ['PIN Code', '[PIN Code]'], ['Country', 'India'], ['Address Type', 'Residential']] } },
    { heading: 'Document Details', table: { headers: ['Field', 'Details'], rows: [['Document Type', '[Electricity Bill / Rental Agreement / Aadhaar]'], ['Issue Date', '[DD/MM/YYYY]'], ['Validity', '[DD/MM/YYYY]'], ['Verified By', 'HR Department'], ['Verification Date', '[DD/MM/YYYY]']] } },
    { heading: 'Note', content: 'Address proof documents are retained in employee records for compliance and verification purposes. Documents older than 3 months may not be accepted as valid proof.' },
  ],
};

const PHOTO_PREVIEW = {
  sections: [
    { heading: 'Employee Photograph', content: 'Passport-size photograph submitted for employee identification and records. Used for ID card, internal directory, and official correspondence.' },
    { heading: 'Photo Specifications', table: { headers: ['Field', 'Details'], rows: [['Format', 'JPEG / PNG'], ['Dimensions', '3.5 cm x 4.5 cm (passport size)'], ['Resolution', '300 DPI minimum'], ['Background', 'White / Light Blue'], ['File Size', 'Max 2 MB']] } },
    { heading: 'Employee Details', table: { headers: ['Field', 'Details'], rows: [['Employee Name', '[Employee Name]'], ['Employee Code', 'CFT-XXXX'], ['Department', '[Department Name]'], ['Date of Submission', '[DD/MM/YYYY]'], ['Purpose', 'Employee ID Card & Records']] } },
    { heading: 'Note', content: 'Photographs must be recent (taken within the last 6 months). Snapshots, selfies, or edited photos are not accepted. Please submit a professional photograph with a neutral expression.' },
  ],
};

const OFFER_LETTER_PREVIEW = {
  sections: [
    { heading: 'Offer Letter', content: 'CoreFusion Technologies Pvt. Ltd. is pleased to extend this offer of employment. This letter outlines the terms and conditions of your position with the company.' },
    { heading: 'Offer Details', table: { headers: ['Field', 'Details'], rows: [['Position', 'Senior Software Engineer'], ['Department', 'Engineering — Platform Team'], ['Reporting To', 'Rajesh Kumar, VP of Engineering'], ['Joining Date', 'August 1, 2026'], ['Work Location', 'CoreFusion Technologies, Bangalore / Hybrid'], ['Employment Type', 'Full-Time, Permanent']] } },
    { heading: 'Compensation', table: { headers: ['Component', 'Annual (INR)', 'Monthly (INR)'], rows: [['Base Salary', '₹18,00,000', '₹1,50,000'], ['Variable Pay (15%)', '₹2,70,000', '₹22,500'], ['Sign-On Bonus', '₹1,50,000', '— (one-time)'], ['Total CTC', '₹22,20,000', '—']] } },
    { heading: 'Benefits & Perquisites', content: 'Health insurance (family floater ₹5L), term life insurance (₹1 Cr), employee stock options (ESOP) vesting over 4 years with 1-year cliff, 24 paid leave days per year, flexible work arrangement (3 days in-office), annual learning & development budget of ₹50,000, annual retreat & team outings.' },
    { heading: 'Probation & Notice', content: 'You will be on probation for the first 6 months from the date of joining. Upon successful completion, your employment will be confirmed in writing. The notice period during probation is 1 month, and after confirmation is 2 months. Either party may terminate the employment by providing the requisite notice period or payment in lieu thereof.' },
    { heading: 'Confidentiality', content: 'As a condition of employment, you will be required to sign the company\'s Non-Disclosure Agreement and Intellectual Property Assignment Agreement on or before your date of joining. All work product created during your tenure will belong to CoreFusion Technologies Pvt. Ltd.' },
    { heading: 'Acceptance', content: 'Please sign below to indicate your acceptance of this offer on or before July 25, 2026. Failure to respond by this date may result in the offer being withdrawn.' },
    { heading: 'Signatures', table: { headers: ['Party', 'Name', 'Title', 'Date'], rows: [['CoreFusion Tech', 'Priya Mehta', 'HR Director', 'July 10, 2026'], ['Candidate', '[Candidate Name]', '[To be signed]', '']] } },
  ],
};

const CONTRACT_PREVIEW = {
  sections: [
    { heading: 'Employment Contract', content: 'This Employment Contract ("Contract") is entered into between CoreFusion Technologies Pvt. Ltd. ("Employer") and the undersigned Employee, effective as of the joining date specified in the Offer Letter.' },
    { heading: '1. Position & Duties', content: 'The Employee is engaged as Senior Software Engineer in the Engineering — Platform Team. Duties include designing, developing, and maintaining production software systems; participating in code reviews; mentoring junior engineers; and contributing to architectural decisions.' },
    { heading: '2. Compensation & Benefits', table: { headers: ['Item', 'Details'], rows: [['CTC', '₹22,20,000 per annum (as per Offer Letter)'], ['Pay Cycle', 'Monthly, last working day of each month'], ['Deductions', 'TDS, PF, ESI as per applicable laws'], ['Annual Bonus', 'Up to 15% of base, based on performance & company results'], ['ESOPs', '4,000 options, 4-year vesting, 1-year cliff']] } },
    { heading: '3. Working Hours & Location', content: 'Standard working hours are 40 hours per week (Monday to Friday). Flexible scheduling is permitted with manager approval. Primary work location is CoreFusion Technologies, Bangalore. Hybrid work (3 days office / 2 days remote) is available after the probation period.' },
    { heading: '4. Intellectual Property', content: 'All inventions, discoveries, source code, documentation, and other work product created during the term of employment shall be the sole property of CoreFusion Technologies Pvt. Ltd. The Employee assigns all rights, title, and interest in such work product to the Employer.' },
    { heading: '5. Non-Competition & Non-Solicitation', content: 'For a period of twelve (12) months following termination, the Employee shall not directly or indirectly engage in any business that competes with CoreFusion Technologies, nor solicit any employee, contractor, or client of the Company.' },
    { heading: '6. Termination', table: { headers: ['Condition', 'Notice Period', 'Severance'], rows: [['During Probation', '1 month', 'None'], ['After Confirmation', '2 months', '2 months CTC'], ['Termination for Cause', 'Immediate', 'None'], ['Layoff / Redundancy', '2 months or pay-in-lieu', 'As per company policy']] } },
    { heading: '7. Governing Law', content: 'This Contract shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.' },
    { heading: 'Signatures', table: { headers: ['Party', 'Name', 'Title', 'Date'], rows: [['Employer', 'Priya Mehta', 'HR Director', ''], ['Employee', '[Employee Name]', '[To be signed]', '']] } },
  ],
};

const PROPOSAL_PREVIEW = {
  sections: [
    { heading: 'Project Proposal — Core Banking Modernization', content: 'This proposal outlines CoreFusion Technologies\' plan to modernize the core banking platform for Acme Corp, covering architecture, timeline, and investment.' },
    { heading: 'Executive Summary', content: 'CoreFusion Technologies proposes a phased modernization of Acme Corp\'s legacy core banking system. The project will migrate critical banking services to a cloud-native microservices architecture while ensuring zero downtime for end customers. Total estimated investment: $2.4M over 18 months.' },
    { heading: 'Scope of Work', table: { headers: ['Phase', 'Description', 'Duration', 'Team Size'], rows: [['Phase 1', 'Discovery & Architecture Design', '6 weeks', '5 engineers'], ['Phase 2', 'Core Migration & API Layer', '12 weeks', '8 engineers'], ['Phase 3', 'Testing & QA', '8 weeks', '6 engineers'], ['Phase 4', 'Go-Live & Support', '4 weeks', '4 engineers']] } },
    { heading: 'Technology Stack', content: 'Java 17, Spring Boot, PostgreSQL, Redis, Kubernetes (EKS), Kafka for event streaming, React for admin dashboards.' },
  ],
};

const SRS_PREVIEW = {
  sections: [
    { heading: 'Software Requirements Specification — v2.1', content: 'Detailed functional and non-functional requirements for the Core Banking Modernization project.' },
    { heading: '1. Functional Requirements', table: { headers: ['ID', 'Requirement', 'Priority', 'Status'], rows: [['FR-001', 'Real-time transaction processing', 'Critical', 'Approved'], ['FR-002', 'Multi-currency support', 'High', 'Approved'], ['FR-003', 'Automated KYC verification', 'High', 'In Review'], ['FR-004', 'Mobile banking API gateway', 'Critical', 'Approved'], ['FR-005', 'Regulatory reporting module', 'Medium', 'Draft']] } },
    { heading: '2. Non-Functional Requirements', table: { headers: ['Metric', 'Target', 'Measurement'], rows: [['Response Time', '< 200ms p99', 'Load testing'], ['Availability', '99.99%', 'Monitoring'], ['Throughput', '10,000 TPS', 'Stress testing'], ['Data Recovery', 'RPO < 1 min', 'Disaster recovery drill']] } },
    { heading: '3. Constraints', content: 'The system must comply with PCI-DSS Level 1, SOC 2 Type II, and RBI guidelines. All data at rest must be encrypted using AES-256. PII data must be stored in India-based regions only.' },
  ],
};

const REPORT_PREVIEW = {
  sections: [
    { heading: 'Q2 2026 Progress Report', content: 'Summary of project milestones, deliverables, and risks for the second quarter of 2026.' },
    { heading: 'Milestone Tracker', table: { headers: ['Milestone', 'Target Date', 'Actual Date', 'Status'], rows: [['API Gateway Live', '2026-04-15', '2026-04-14', 'Completed'], ['Core DB Migration', '2026-05-30', '2026-06-05', 'Completed (delayed)'], ['Mobile SDK Release', '2026-06-15', '—', 'In Progress'], ['UAT Phase 1', '2026-07-01', '—', 'Scheduled']] } },
    { heading: 'Budget Summary', table: { headers: ['Category', 'Budgeted', 'Spent', 'Remaining'], rows: [['Infrastructure', '$480,000', '$312,000', '$168,000'], ['Development', '$860,000', '$520,000', '$340,000'], ['QA & Testing', '$240,000', '$95,000', '$145,000'], ['Project Management', '$180,000', '$110,000', '$70,000']] } },
    { heading: 'Risks & Mitigations', content: 'Risk 1: Third-party KYC provider API latency — Mitigation: Implementing caching layer and fallback provider. Risk 2: Regulatory audit scheduling conflict — Mitigation: Coordinating with compliance team for revised timeline.' },
  ],
};

const NDA_PREVIEW = {
  sections: [
    { heading: 'Non-Disclosure Agreement', content: 'This Non-Disclosure Agreement ("Agreement") is entered into as of December 10, 2025, by and between Acme Corp ("Disclosing Party") and CoreFusion Technologies Pvt. Ltd. ("Receiving Party").' },
    { heading: '1. Definition of Confidential Information', content: 'All non-public information disclosed by either party, including but not limited to: source code, business plans, financial data, customer lists, trade secrets, technical specifications, and architectural designs.' },
    { heading: '2. Obligations', content: 'The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose such information to any third party without prior written consent; (c) use the information solely for the purposes of the Core Banking Modernization project.' },
    { heading: '3. Term', content: 'This Agreement shall remain in effect for a period of two (2) years from the date of execution, unless terminated earlier by either party with 30 days written notice.' },
    { heading: 'Signatures', table: { headers: ['Party', 'Name', 'Title', 'Date'], rows: [['Acme Corp', 'James Wilson', 'CTO', 'Dec 10, 2025'], ['CoreFusion Tech', 'Rajesh Kumar', 'CEO', 'Dec 10, 2025']] } },
  ],
};

const API_GUIDE_PREVIEW = {
  sections: [
    { heading: 'API Integration Guide', content: 'Technical documentation for integrating with the CoreFusion Banking API Gateway. Covers authentication, endpoints, error handling, and rate limits.' },
    { heading: 'Authentication', content: 'All API requests must include a valid OAuth 2.0 Bearer token in the Authorization header. Tokens are obtained via the /oauth/token endpoint using client_credentials grant type.' },
    { heading: 'Key Endpoints', table: { headers: ['Method', 'Endpoint', 'Description', 'Rate Limit'], rows: [['GET', '/api/v1/accounts', 'List customer accounts', '100/min'], ['POST', '/api/v1/transfers', 'Initiate fund transfer', '20/min'], ['GET', '/api/v1/transactions', 'Transaction history', '60/min'], ['POST', '/api/v1/beneficiaries', 'Add beneficiary', '10/min'], ['GET', '/api/v1/statements/:id', 'Download statement', '30/min']] } },
    { heading: 'Error Codes', table: { headers: ['Code', 'Meaning', 'Action'], rows: [['400', 'Invalid request body', 'Check payload schema'], ['401', 'Invalid/expired token', 'Refresh OAuth token'], ['403', 'Insufficient permissions', 'Check scope grants'], ['429', 'Rate limit exceeded', 'Retry after Retry-After header'], ['500', 'Internal server error', 'Contact support']] } },
    { heading: 'Webhooks', content: 'Subscribe to real-time events (transaction.completed, account.updated, beneficiary.added) via the Webhooks management endpoint. Payloads are signed with HMAC-SHA256 for verification.' },
  ],
};

const PAYSLIP_PREVIEW = {
  sections: [
    { heading: 'Payslip — July 2026', content: 'Monthly salary slip for the pay period July 1–31, 2026. This is a system-generated document and does not require a signature.' },
    { heading: 'Employee Details', table: { headers: ['Field', 'Value'], rows: [['Employee Code', 'CFT-1042'], ['Name', '[Employee Name]'], ['Department', 'Engineering'], ['Designation', 'Senior Software Engineer'], ['Pay Period', 'July 2026'], ['Payment Date', 'July 31, 2026']] } },
    { heading: 'Earnings', table: { headers: ['Component', 'Amount (INR)'], rows: [['Basic Salary', '₹1,50,000'], ['House Rent Allowance (HRA)', '₹60,000'], ['Conveyance Allowance', '₹1,600'], ['Medical Allowance', '₹12,500'], ['Special Allowance', '₹25,900'], ['Performance Bonus', '₹22,500'], ['Gross Earnings', '₹2,72,500']] } },
    { heading: 'Deductions', table: { headers: ['Component', 'Amount (INR)'], rows: [['Provident Fund (PF)', '₹18,000'], ['ESI', '₹0'], ['Professional Tax', '₹200'], ['Income Tax (TDS)', '₹42,000'], ['Total Deductions', '₹60,200']] } },
    { heading: 'Net Pay', content: 'Net Pay (in hand): ₹2,12,300 — credited to account ending ****4821 (HDFC Bank) on July 31, 2026 via NEFT.' },
  ],
};

const INVOICE_PREVIEW = {
  sections: [
    { heading: 'Invoice', content: 'This invoice is raised by CoreFusion Technologies Pvt. Ltd. for professional services rendered during the billing period.' },
    { heading: 'Invoice Details', table: { headers: ['Field', 'Value'], rows: [['Invoice Number', 'INV-2026-0042'], ['Issue Date', 'July 1, 2026'], ['Due Date', 'July 31, 2026'], ['Billing Period', 'June 2026'], ['Payment Terms', 'Net 30']] } },
    { heading: 'Line Items', table: { headers: ['Description', 'Hours', 'Rate', 'Amount'], rows: [['Platform Development', '120', '$85/hr', '$10,200'], ['API Integration Work', '40', '$95/hr', '$3,800'], ['Code Review & QA Support', '24', '$75/hr', '$1,800'], ['Project Management', '16', '$80/hr', '$1,280'], ['Total', '', '', '$17,080']] } },
    { heading: 'Bank Details', table: { headers: ['Field', 'Value'], rows: [['Bank Name', 'HDFC Bank'], ['Account Name', 'CoreFusion Technologies Pvt. Ltd.'], ['Account Number', '50100012345678'], ['IFSC', 'HDFC0001234'], ['SWIFT', 'HDFCINBB']] } },
  ],
};

const POLICY_PREVIEW = {
  sections: [
    { heading: 'Company Policy Document', content: 'This document outlines the policies and guidelines that govern employment at CoreFusion Technologies Pvt. All employees are expected to read, understand, and adhere to these policies.' },
    { heading: '1. Code of Conduct', content: 'All employees must maintain the highest standards of professional integrity. This includes honesty in all business dealings, respect for colleagues, confidentiality of sensitive information, and compliance with all applicable laws and regulations.' },
    { heading: '2. Leave Policy', table: { headers: ['Leave Type', 'Days/Year', 'Approval Required'], rows: [['Annual Leave', '24 days', 'Manager'], ['Sick Leave', '12 days', 'Self (3+ days: Manager)'], ['Casual Leave', '6 days', 'Manager'], ['Maternity/Paternity', '26/15 days', 'HR'], ['Bereavement', '5 days', 'HR']] } },
    { heading: '3. Work From Home', content: 'Employees may work remotely up to 2 days per week after completing their probation period. Fully remote arrangements require VP-level approval and are subject to role suitability.' },
    { heading: '4. Anti-Harassment', content: 'CoreFusion Technologies maintains a zero-tolerance policy toward harassment of any kind. All complaints will be investigated promptly and confidentially by the HR team.' },
  ],
};

const CERTIFICATE_PREVIEW = {
  sections: [
    { heading: 'Certificate of Completion', content: 'This is to certify that the undersigned has successfully completed the assigned training / project milestone as documented below.' },
    { heading: 'Details', table: { headers: ['Field', 'Value'], rows: [['Certificate ID', 'CERT-2026-0087'], ['Recipient', '[Employee Name]'], ['Program', 'Advanced Cloud Architecture — AWS Solutions Architect'], ['Duration', 'March 2026 – June 2026 (120 hours)'], ['Completion Date', 'June 30, 2026'], ['Issued By', 'CoreFusion Technologies Learning & Development']] } },
    { heading: 'Competencies Acquired', content: 'AWS Solutions Architecture, Infrastructure as Code (Terraform), Container Orchestration (EKS/ECS), CI/CD Pipeline Design, Cost Optimization & FinOps, Security Best Practices (IAM, KMS, GuardDuty).' },
    { heading: 'Verification', content: 'This certificate can be verified at https://corefusiontech.com/verify/CERT-2026-0087 using the certificate ID above.' },
  ],
};

function generateFilePDF(file) {
  const preview = getPreviewForFile(file);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addPageIfNeeded = (needed) => {
    if (y + needed > 297 - margin) { doc.addPage(); y = margin; }
  };

  const drawLine = () => {
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  if (preview) {
    const firstHeading = preview.sections[0]?.heading || file.name;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 60, 120);
    doc.text(firstHeading, pageW / 2, y, { align: 'center' });
    y += 10;
    drawLine();

    for (let i = 0; i < preview.sections.length; i++) {
      const s = preview.sections[i];
      if (i === 0) continue;

      if (s.heading) {
        addPageIfNeeded(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text(s.heading, margin, y);
        y += 8;
      }

      if (s.content) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(s.content, contentW);
        addPageIfNeeded(lines.length * 5 + 4);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 4;
      }

      if (s.table) {
        const { headers, rows } = s.table;
        const colCount = headers.length;
        const colWidth = contentW / colCount;
        const rowH = 8;

        addPageIfNeeded((rows.length + 1) * rowH + 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(50, 70, 110);
        doc.rect(margin, y, contentW, rowH, 'F');
        headers.forEach((h, ci) => {
          doc.text(h, margin + ci * colWidth + 2, y + 5.5);
        });
        y += rowH;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        rows.forEach((row, ri) => {
          addPageIfNeeded(rowH + 2);
          if (ri % 2 === 0) {
            doc.setFillColor(245, 245, 250);
            doc.rect(margin, y, contentW, rowH, 'F');
          }
          doc.setTextColor(50, 50, 50);
          row.forEach((cell, ci) => {
            const text = doc.splitTextToSize(String(cell), colWidth - 4);
            doc.text(text[0] || '', margin + ci * colWidth + 2, y + 5.5);
          });
          y += rowH;
        });
        y += 4;
      }
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text(file.name, pageW / 2, 40, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Category: ${file.category || 'N/A'}`, margin, 60);
    doc.text(`Size: ${file.size || 'N/A'}`, margin, 68);
    doc.text(`Uploaded: ${file.uploadedOn || 'N/A'}`, margin, 76);
    doc.text(`By: ${file.uploadedBy || 'N/A'}`, margin, 84);

    drawLine();
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('This document is available for reference.', margin, 96);
    doc.text('For the full version, please contact the CoreFusion team.', margin, 104);
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`CoreFusion Technologies — ${file.name}`, margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, 290, { align: 'right' });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.pdf$/i, '') + '.pdf';
  doc.save(safeName);
}

function Files({ files }) {
  const [previewFile, setPreviewFile] = useState(null);
  const preview = previewFile ? getPreviewForFile(previewFile) : null;

  return (
    <div className="space-y-4">
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
                  <tr key={f.id} className={`hover:bg-surface-low dark:hover:bg-dark-surface-low transition-colors ${previewFile?.id === f.id ? 'bg-brand/5 dark:bg-brand/10' : ''}`}>
                    <td className="px-stack-lg py-4">
                      <div className="flex items-center gap-2">
                        <Icon name="description" className="text-brand text-lg" />
                        <button onClick={() => setPreviewFile(previewFile?.id === f.id ? null : f)} className="text-body-md text-brand-dark dark:text-dark-brand font-semibold hover:underline text-left cursor-pointer">{f.name}</button>
                      </div>
                    </td>
                    <td className="px-stack-lg py-4"><Badge className="text-label-caps">{f.category}</Badge></td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.size}</td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.uploadedOn}</td>
                    <td className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">{f.uploadedBy}</td>
                    <td className="px-stack-lg py-4">
                      <button onClick={() => generateFilePDF(f)} className="text-brand hover:text-brand-dark cursor-pointer" title="Download PDF">
                        <Icon name="download" className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {preview && (
        <div className="bg-white dark:bg-dark-surface border border-brand/30 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-stack-lg py-4 bg-brand/5 dark:bg-brand/10 border-b border-brand/20">
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-white font-bold">Document Preview</h3>
            <button onClick={() => setPreviewFile(null)} className="text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer">
              <Icon name="close" className="text-xl" />
            </button>
          </div>
          <div className="px-stack-lg py-stack-md space-y-stack-md">
            {preview.sections.map((s, i) => (
              <div key={i}>
                {s.heading && <h4 className="font-display text-body-lg text-brand-dark dark:text-white font-bold mb-2">{s.heading}</h4>}
                {s.content && <p className="text-body-md text-ink dark:text-white/90 leading-relaxed">{s.content}</p>}
                {s.table && (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left text-body-sm border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
                      <thead className="bg-surface-container dark:bg-dark-surface-container">
                        <tr>
                          {s.table.headers.map((h, hi) => (
                            <th key={hi} className="px-4 py-2.5 font-label-caps text-label-caps uppercase text-white/70">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                        {s.table.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-surface-low dark:hover:bg-dark-surface-low">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-4 py-2.5 text-body-sm text-ink dark:text-white">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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

export default function ClientPortal() {
  useDocumentTitle('Client Portal | CoreFusion Technologies');
  const { user, accessToken, initializing, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ contact_name: user?.email || '', email: user?.email || '', company_name: '', industry: '', country: '' });
  const [projects, setProjects] = useState(demoClientProjects);
  const [invoices, setInvoices] = useState(demoClientInvoices);
  const [tickets, setTickets] = useState(demoClientTickets);
  const [payments, setPayments] = useState(demoClientPayments);
  const [files, setFiles] = useState(demoClientFiles);
  const [meetings, setMeetings] = useState(demoClientMeetings);
  const [reports, setReports] = useState(demoClientReports);

  useEffect(() => {
    if (!user || !user) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      fetchMyProfile(accessToken).then((res) => res.data),
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
  }, [user]);

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
  if (!user) { navigate('/login', { replace: true }); return null; }
  if (loading) return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between gap-4 mb-stack-lg">
          <div className="flex items-center gap-4">
            <Avatar name={profile.contact_name || 'Client'} size="lg" />
            <div>
              <h1 className="font-display text-headline-md text-white font-bold">{profile.contact_name || 'Client'}</h1>
              <p className="text-body-sm text-white/70">{profile.email || ''} &middot; {profile.company_name}</p>
            </div>
          </div>
          <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
            Sign Out
          </Button>
        </div>

        <div className="flex gap-stack-lg">
          <aside className="w-56 shrink-0 hidden md:block">
            <nav className="flex flex-col gap-1">
              {clientPortalTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-caps text-label-caps uppercase text-left transition-colors ${
                    activeTab === tab.id ? 'bg-brand/10 text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}>
                  <Icon name={tab.icon} className="text-lg" />{tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex md:hidden flex-wrap gap-1 mb-stack-lg border-b border-outline-variant overflow-x-auto">
            {clientPortalTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-label-caps text-label-caps uppercase border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white font-bold border-white' : 'text-white/70 font-semibold border-transparent hover:text-white hover:border-white/30'
                }`}>
                <Icon name={tab.icon} className="text-lg" />{tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0">
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
