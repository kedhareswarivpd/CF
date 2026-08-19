const BRAND = [37, 99, 235]; // #2563eb
const BRAND_DARK = [13, 34, 64]; // #0d2240
const CYAN = [56, 189, 248]; // #38bdf8
const INK = [15, 23, 42]; // #0f172a
const MUTED = [100, 116, 139]; // #64748b
const WHITE = [255, 255, 255];
const EMERALD = [16, 185, 129];
const ROSE = [244, 63, 94];

export const TYPE_LABEL = {
  contract: 'Contract & Agreement',
  id_proof: 'Identity Document',
  certificate: 'Professional Certificate',
  resume: 'Professional Resume',
  other: 'Official Document',
};

function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 7900) return 'Seven Thousand Nine Hundred';
  if (num === 8700) return 'Eight Thousand Seven Hundred';
  if (num === 0) return 'Zero';
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
  if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  return `${num}`;
}

export async function downloadDocumentPdf(doc, profile = {}) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;

  const docTitle = String(doc.name || doc.title || 'Document');
  const empName = profile.name || 'Demo Developer';
  const empCode = profile.employee_code || 'EMP-79401';
  const empRole = profile.designation || 'Senior Software Engineer';
  const empDept = profile.department || 'Engineering';

  const isContract = docTitle.toLowerCase().includes('contract') || docTitle.toLowerCase().includes('employment');
  const isNDA = docTitle.toLowerCase().includes('disclosure') || docTitle.toLowerCase().includes('nda') || docTitle.toLowerCase().includes('ip agreement');
  const isCert = docTitle.toLowerCase().includes('aws') || docTitle.toLowerCase().includes('certif') || doc.type === 'certificate';

  let cursor = margin;

  const drawHeader = (title, subtitle) => {
    pdf.setFillColor(...BRAND_DARK);
    pdf.rect(0, 0, pageW, 36, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...WHITE);
    pdf.text('COREFUSION TECHNOLOGIES', margin, 15);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...CYAN);
    pdf.text('Enterprise Digital & AI Engineering  |  www.corefusiontech.com', margin, 22);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...WHITE);
    pdf.text(title.toUpperCase(), pageW - margin, 15, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...CYAN);
    pdf.text(subtitle, pageW - margin, 22, { align: 'right' });

    cursor = 46;
  };

  const drawFooter = (pageNum, total) => {
    pdf.setPage(pageNum);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, pageH - 14, pageW - margin, pageH - 14);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text('CoreFusion Technologies Inc.  ·  Strictly Private & Confidential', margin, pageH - 8);
    pdf.text(`Page ${pageNum} of ${total}`, pageW - margin, pageH - 8, { align: 'right' });
  };

  if (isCert) {
    // Certificate Template
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageW, pageH, 'F');

    // Outer decorative border
    pdf.setDrawColor(...BRAND_DARK);
    pdf.setLineWidth(1.5);
    pdf.rect(12, 12, pageW - 24, pageH - 24);

    pdf.setDrawColor(...BRAND);
    pdf.setLineWidth(0.5);
    pdf.rect(15, 15, pageW - 30, pageH - 30);

    cursor = 35;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('COREFUSION TECHNICAL ACADEMY & AWS CLOUD ACCREDITATION', pageW / 2, cursor, { align: 'center' });

    cursor += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(...MUTED);
    pdf.text('Global Cloud & Architecture Certification Board', pageW / 2, cursor, { align: 'center' });

    cursor += 16;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('CERTIFICATE OF ACHIEVEMENT', pageW / 2, cursor, { align: 'center' });

    cursor += 6;
    pdf.setFillColor(...BRAND);
    pdf.rect((pageW - 80) / 2, cursor, 80, 2, 'F');

    cursor += 16;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(...MUTED);
    pdf.text('This is proudly presented to certify that', pageW / 2, cursor, { align: 'center' });

    cursor += 14;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(...BRAND);
    pdf.text(empName, pageW / 2, cursor, { align: 'center' });

    cursor += 12;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(...INK);
    pdf.text(`has demonstrated proven technical proficiency and successfully attained the professional credential`, pageW / 2, cursor, { align: 'center' });

    cursor += 14;
    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(margin + 5, cursor - 6, contentW - 10, 22, 3, 3, 'F');
    pdf.setDrawColor(191, 219, 254);
    pdf.roundedRect(margin + 5, cursor - 6, contentW - 10, 22, 3, 3, 'D');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text(docTitle.replace('.pdf', ''), pageW / 2, cursor + 5, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND);
    pdf.text('Credential Level: Professional / Enterprise Architect  ·  Score: 940/1000', pageW / 2, cursor + 12, { align: 'center' });

    cursor += 36;
    // Details Grid
    const certDetails = [
      ['Certificate ID:', 'AWS-PSA-2026-89421-CF'],
      ['Issue Date:', doc.uploadedOn || new Date().toISOString().slice(0, 10)],
      ['Validity:', '3 Years (Active until 2029)'],
      ['Verification Hash:', '0x889a74c2e19f772b9a044d01b972e293'],
    ];

    certDetails.forEach(([lbl, val], i) => {
      const y = cursor + (i * 8);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...MUTED);
      pdf.text(lbl, margin + 25, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...INK);
      pdf.text(val, margin + 70, y);
    });

    cursor += 48;
    // Signatures
    pdf.line(margin + 15, cursor, margin + 70, cursor);
    pdf.line(pageW - margin - 70, cursor, pageW - margin - 15, cursor);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('Dr. Richard Vance', margin + 42.5, cursor + 5, { align: 'center' });
    pdf.text('Elena Rostova', pageW - margin - 42.5, cursor + 5, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text('Chief Technology Officer, CoreFusion', margin + 42.5, cursor + 10, { align: 'center' });
    pdf.text('Director of Cloud Architecture, AWS Cert Board', pageW - margin - 42.5, cursor + 10, { align: 'center' });

  } else if (isContract) {
    // Employment Contract Template
    drawHeader('OFFICIAL EMPLOYMENT CONTRACT', 'Human Resources Agreement');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('PERMANENT FULL-TIME EMPLOYMENT AGREEMENT', margin, cursor);
    cursor += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(...MUTED);
    pdf.text(`This Employment Agreement is entered between CoreFusion Technologies Inc. ("Company") and ${empName} ("Employee").`, margin, cursor);
    cursor += 10;

    // Summary Box
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, cursor, contentW, 28, 2, 2, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, cursor, contentW, 28, 2, 2, 'D');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('Employee Details:', margin + 4, cursor + 6);
    pdf.text('Position & Dept:', margin + 4, cursor + 14);
    pdf.text('Compensation:', margin + 4, cursor + 22);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...INK);
    pdf.text(`${empName}  (Code: ${empCode})`, margin + 35, cursor + 6);
    pdf.text(`${empRole}  |  Department: ${empDept}`, margin + 35, cursor + 14);
    pdf.text('$104,400 USD / Annum ($8,700.00 Gross Monthly)', margin + 35, cursor + 22);

    cursor += 36;

    const clauses = [
      {
        num: '1. Position & Duties',
        body: `The Employee will serve as ${empRole}. Duties include architecture design, coding, agile sprint execution, client solutions, and mentoring junior team members. The Employee shall report directly to the VP of Engineering.`,
      },
      {
        num: '2. Compensation & Monthly Payouts',
        body: 'The Employee will receive a gross monthly salary of $8,700.00 ($6,500 Base + $1,200 HRA + $1,000 Special Allowance), payable via direct bank deposit on the final business day of each calendar month after standard deductions.',
      },
      {
        num: '3. Working Hours & Office Location',
        body: 'Standard full-time employment entails 40 hours per week. The primary working mode is hybrid/remote with access to CoreFusion HQ technology center and collaborative tools.',
      },
      {
        num: '4. Benefits & Paid Time Off',
        body: 'The Employee is eligible for comprehensive medical, dental, and vision insurance, 24 days of paid annual leave, public holidays, and annual training budget sponsorship up to $3,000.',
      },
      {
        num: '5. Confidentiality, Non-Compete & IP Assignment',
        body: 'All source code, designs, architectures, and intellectual assets developed during employment remain the sole exclusive property of CoreFusion Technologies Inc. The Employee agrees to keep all trade secrets confidential.',
      },
      {
        num: '6. Termination & Notice Period',
        body: 'Either party may terminate this agreement by providing 30 days written notice, or payment in lieu thereof, subject to mutual compliance with state and federal labor guidelines.',
      },
    ];

    clauses.forEach((c) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(...BRAND_DARK);
      pdf.text(c.num, margin, cursor);
      cursor += 5;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...INK);
      const lines = pdf.splitTextToSize(c.body, contentW);
      lines.forEach((l) => {
        pdf.text(l, margin, cursor);
        cursor += 4.2;
      });
      cursor += 3;
    });

    cursor += 6;
    // Signatures
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('IN WITNESS WHEREOF, the parties hereto execute this Agreement:', margin, cursor);
    cursor += 12;

    pdf.line(margin, cursor, margin + 65, cursor);
    pdf.line(pageW - margin - 65, cursor, pageW - margin, cursor);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('Sarah Jenkins', margin, cursor + 5);
    pdf.text(empName, pageW - margin - 65, cursor + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text('VP of People & Culture, CoreFusion Technologies', margin, cursor + 9);
    pdf.text(`Employee (Signed & Verified)`, pageW - margin - 65, cursor + 9);

    drawFooter(1, 1);

  } else if (isNDA) {
    // NDA & IP Agreement Template
    drawHeader('NON-DISCLOSURE & IP AGREEMENT', 'Proprietary Protection Document');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('EMPLOYEE PROPRIETARY INFORMATION & INVENTIONS AGREEMENT', margin, cursor);
    cursor += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.text(`Executed between CoreFusion Technologies Inc. and ${empName} (${empCode}).`, margin, cursor);
    cursor += 9;

    const sections = [
      {
        title: '1. Proprietary Information Definition',
        text: 'Includes all software repositories, cloud architectures, AI models, client contracts, algorithmic pipelines, financial records, roadmap plans, and non-public technical data owned by CoreFusion Technologies.',
      },
      {
        title: '2. Duty of Non-Disclosure',
        text: 'The Employee shall hold all Proprietary Information in strict confidence and shall not disclose, publish, reverse-engineer, or duplicate any such information without prior written executive authorization.',
      },
      {
        title: '3. Assignment of Inventions & Intellectual Property',
        text: 'All inventions, software code, patentable discoveries, system diagrams, and documentation conceived, created, or reduced to practice during employment shall immediately become the exclusive property of the Company.',
      },
      {
        title: '4. Non-Solicitation of Clients & Team Members',
        text: 'During employment and for 12 months following departure, the Employee agrees not to solicit CoreFusion clients, partners, or induce any team members to leave their engagement with CoreFusion.',
      },
      {
        title: '5. Return of Company Equipment & Data Assets',
        text: 'Upon separation, the Employee must immediately surrender all hardware, access keys, tokens, repositories, encrypted databases, and company documents.',
      },
      {
        title: '6. Governing Law & Equitable Remedies',
        text: 'This agreement is governed by the laws of California & Delaware. Unauthorized breach triggers immediate injunctive relief and damages in court.',
      },
    ];

    sections.forEach((s) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...BRAND_DARK);
      pdf.text(s.title, margin, cursor);
      cursor += 4.5;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...INK);
      const lines = pdf.splitTextToSize(s.text, contentW);
      lines.forEach((l) => {
        pdf.text(l, margin, cursor);
        cursor += 4.2;
      });
      cursor += 3;
    });

    cursor += 12;
    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(margin, cursor, contentW, 14, 2, 2, 'F');
    pdf.setDrawColor(187, 247, 208);
    pdf.roundedRect(margin, cursor, contentW, 14, 2, 2, 'D');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(22, 101, 52);
    pdf.text('STATUS: SIGNED, COUNTERSIGNED & COMPLIANT', margin + 5, cursor + 6);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('Digital Signature Verified on Record via CoreFusion Identity Shield (SHA-256 Validated)', margin + 5, cursor + 10.5);

    cursor += 24;
    pdf.line(margin, cursor, margin + 65, cursor);
    pdf.line(pageW - margin - 65, cursor, pageW - margin, cursor);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('Legal Counsel, CoreFusion Tech', margin, cursor + 5);
    pdf.text(`${empName} (Employee)`, pageW - margin - 65, cursor + 5);

    drawFooter(1, 1);

  } else {
    // General Fallback Document
    drawHeader('OFFICIAL EMPLOYEE DOCUMENT', 'Corporate Record');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text(docTitle.replace('.pdf', ''), margin, cursor);
    cursor += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(...MUTED);
    pdf.text(`Employee: ${empName} (${empCode})  ·  Date: ${doc.uploadedOn || new Date().toISOString().slice(0, 10)}`, margin, cursor);
    cursor += 12;

    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, cursor, contentW, 40, 2, 2, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, cursor, contentW, 40, 2, 2, 'D');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('Official Document Summary', margin + 6, cursor + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...INK);
    const desc = `This official document is issued by CoreFusion Technologies Human Resources and Compliance Department. It certifies the active record and verification status of ${empName} for the designated role in ${empDept}.`;
    const dLines = pdf.splitTextToSize(desc, contentW - 12);
    let dy = cursor + 15;
    dLines.forEach((l) => {
      pdf.text(l, margin + 6, dy);
      dy += 5;
    });

    cursor += 50;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...BRAND_DARK);
    pdf.text('Document Metadata & Authentication', margin, cursor);
    cursor += 6;

    const meta = [
      ['Document Title', docTitle],
      ['Document Category', doc.type || 'Official Record'],
      ['Status', 'Verified & Approved'],
      ['Security Classification', 'Level 2 - Confidential Internal'],
    ];

    meta.forEach(([k, v], i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, cursor - 4, contentW, 7, 'F');
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...MUTED);
      pdf.text(k, margin + 4, cursor);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...INK);
      pdf.text(v, margin + 60, cursor);
      cursor += 7;
    });

    drawFooter(1, 1);
  }

  const safeFileName = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/\.pdf$/i, '') + '.pdf';
  pdf.save(safeFileName);
}

export async function downloadPayslipPdf(payslip, profile = {}) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;

  const empName = profile.name || 'Demo Developer';
  const empCode = profile.employee_code || 'EMP-79401';
  const empRole = profile.designation || 'Senior Software Engineer';
  const empDept = profile.department || 'Engineering';
  const month = payslip.month || 'July';
  const year = payslip.year || 2026;
  const grossPay = Number(payslip.grossPay || 8700);
  const deductions = Number(payslip.deductions || 800);
  const netPay = Number(payslip.netPay || (grossPay - deductions));

  // Compute realistic itemized earnings & deductions based on gross & deductions
  const basic = Math.round(grossPay * 0.7471); // e.g. $6,500
  const hra = Math.round(grossPay * 0.1379); // e.g. $1,200
  const specialAllowance = grossPay - basic - hra; // e.g. $1,000

  const tax = Math.round(deductions * 0.625); // e.g. $500
  const insurance = Math.round(deductions * 0.25); // e.g. $200
  const pf = deductions - tax - insurance; // e.g. $100

  // 1. Header Banner
  pdf.setFillColor(...BRAND_DARK);
  pdf.rect(0, 0, pageW, 40, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...WHITE);
  pdf.text('COREFUSION TECHNOLOGIES INC.', margin, 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...CYAN);
  pdf.text('100 Technology Plaza, Suite 500, San Francisco, CA 94107', margin, 23);
  pdf.text('Payroll & Compensation Division  ·  payroll@corefusiontech.com', margin, 29);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(...WHITE);
  pdf.text('SALARY PAYSLIP', pageW - margin, 16, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...CYAN);
  pdf.text(`${month.toUpperCase()} ${year}`, pageW - margin, 23, { align: 'right' });

  pdf.setFillColor(...EMERALD);
  pdf.roundedRect(pageW - margin - 22, 26, 22, 6, 1, 1, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...WHITE);
  pdf.text('PAID', pageW - margin - 11, 30.2, { align: 'center' });

  let cursor = 48;

  // 2. Employee Info Grid
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, cursor, contentW, 34, 2, 2, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, cursor, contentW, 34, 2, 2, 'D');

  const infoCol1 = [
    ['Employee Name:', empName],
    ['Employee ID:', empCode],
    ['Designation:', empRole],
  ];
  const infoCol2 = [
    ['Department:', empDept],
    ['Bank Account:', '•••• •••• •••• 4912'],
    ['Pay Date:', `31 ${month} ${year}`],
  ];

  infoCol1.forEach(([lbl, val], i) => {
    const y = cursor + 8 + (i * 8);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...MUTED);
    pdf.text(lbl, margin + 5, y);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...INK);
    pdf.text(val, margin + 35, y);
  });

  infoCol2.forEach(([lbl, val], i) => {
    const y = cursor + 8 + (i * 8);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...MUTED);
    pdf.text(lbl, margin + 95, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...INK);
    pdf.text(val, margin + 125, y);
  });

  cursor += 42;

  // 3. Compensation Breakdown Table
  const tableW = contentW;
  const colHalfW = tableW / 2;

  // Header Row
  pdf.setFillColor(...BRAND);
  pdf.rect(margin, cursor, colHalfW, 8, 'F');
  pdf.setFillColor(225, 29, 72); // Rose/Red for deductions
  pdf.rect(margin + colHalfW, cursor, colHalfW, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...WHITE);
  pdf.text('EARNINGS & ALLOWANCES', margin + 4, cursor + 5.5);
  pdf.text('AMOUNT (USD)', margin + colHalfW - 4, cursor + 5.5, { align: 'right' });

  pdf.text('DEDUCTIONS & TAXES', margin + colHalfW + 4, cursor + 5.5);
  pdf.text('AMOUNT (USD)', margin + tableW - 4, cursor + 5.5, { align: 'right' });

  cursor += 8;

  const earningsRows = [
    ['Basic Salary', `$${basic.toLocaleString()}.00`],
    ['House Rent Allowance (HRA)', `$${hra.toLocaleString()}.00`],
    ['Special / Tech Allowance', `$${specialAllowance.toLocaleString()}.00`],
    ['Performance Bonus', '$0.00'],
  ];

  const deductionRows = [
    ['Federal & State Income Tax', `$${tax.toLocaleString()}.00`],
    ['Health Insurance & Dental Plan', `$${insurance.toLocaleString()}.00`],
    ['401(k) / Provident Fund', `$${pf.toLocaleString()}.00`],
    ['Other Statutory Deductions', '$0.00'],
  ];

  for (let i = 0; i < 4; i++) {
    const rowY = cursor + (i * 8);
    if (i % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, rowY, tableW, 8, 'F');
    }
    pdf.setDrawColor(241, 245, 249);
    pdf.line(margin, rowY + 8, margin + tableW, rowY + 8);
    pdf.line(margin + colHalfW, rowY, margin + colHalfW, rowY + 8);

    // Left
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...INK);
    pdf.text(earningsRows[i][0], margin + 4, rowY + 5.5);
    pdf.text(earningsRows[i][1], margin + colHalfW - 4, rowY + 5.5, { align: 'right' });

    // Right
    pdf.text(deductionRows[i][0], margin + colHalfW + 4, rowY + 5.5);
    pdf.text(deductionRows[i][1], margin + tableW - 4, rowY + 5.5, { align: 'right' });
  }

  cursor += 32;

  // Subtotals Row
  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, cursor, tableW, 9, 'F');
  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, cursor, margin + tableW, cursor);
  pdf.line(margin, cursor + 9, margin + tableW, cursor + 9);
  pdf.line(margin + colHalfW, cursor, margin + colHalfW, cursor + 9);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...BRAND_DARK);
  pdf.text('TOTAL GROSS EARNINGS', margin + 4, cursor + 6);
  pdf.setTextColor(...BRAND);
  pdf.text(`$${grossPay.toLocaleString()}.00`, margin + colHalfW - 4, cursor + 6, { align: 'right' });

  pdf.setTextColor(...BRAND_DARK);
  pdf.text('TOTAL DEDUCTIONS', margin + colHalfW + 4, cursor + 6);
  pdf.setTextColor(...ROSE);
  pdf.text(`-$${deductions.toLocaleString()}.00`, margin + tableW - 4, cursor + 6, { align: 'right' });

  cursor += 16;

  // 4. Net Pay Callout Banner
  pdf.setFillColor(236, 253, 245);
  pdf.roundedRect(margin, cursor, contentW, 26, 3, 3, 'F');
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(margin, cursor, contentW, 26, 3, 3, 'D');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(6, 95, 70);
  pdf.text('NET SALARY PAYABLE (TAKE HOME)', margin + 6, cursor + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(4, 120, 87);
  pdf.text(`$${netPay.toLocaleString()}.00 USD`, margin + 6, cursor + 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(6, 95, 70);
  pdf.text(`Amount in Words:  ${numberToWords(netPay)} US Dollars Only`, pageW - margin - 6, cursor + 14, { align: 'right' });

  cursor += 34;

  // 5. Notes & Verification Box
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...MUTED);
  pdf.text('PAYROLL REMARKS & NOTES:', margin, cursor);
  cursor += 4.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...INK);
  pdf.text('1. Direct deposit has been processed to your designated bank account on file.', margin, cursor);
  cursor += 4;
  pdf.text('2. Please retain this payslip for your income tax filings and official financial verification.', margin, cursor);
  cursor += 4;
  pdf.text('3. For any discrepancies or tax inquiries, reach out to payroll@corefusiontech.com within 5 business days.', margin, cursor);

  cursor += 16;

  // 6. Sign-off & Stamp
  pdf.line(margin, cursor + 10, margin + 60, cursor + 10);
  pdf.line(pageW - margin - 60, cursor + 10, pageW - margin, cursor + 10);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...BRAND_DARK);
  pdf.text('Marcus Sterling', margin, cursor + 14);
  pdf.text('Automated Payroll System', pageW - margin - 60, cursor + 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text('Director of Global Payroll, CoreFusion Inc.', margin, cursor + 18);
  pdf.text('Digitally Authenticated Timestamped Record', pageW - margin - 60, cursor + 18);

  // Footer
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text('CoreFusion Technologies Inc.  ·  Strictly Private & Confidential  ·  Generated via CoreFusion CoreHR', margin, pageH - 7);
  pdf.text(`Doc Ref: PS-${year}-${String(month).toUpperCase()}-${empCode}`, pageW - margin, pageH - 7, { align: 'right' });

  const safeFileName = `CoreFusion_Payslip_${month}_${year}_${empCode}.pdf`;
  pdf.save(safeFileName);
}