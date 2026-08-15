const BRAND = [61, 98, 104];
const BRAND_DARK = [44, 62, 65];
const CYAN = [167, 205, 213];
const INK = [25, 28, 30];
const MUTED = [116, 120, 126];
const WHITE = [255, 255, 255];

export const TYPE_LABEL = { contract: 'Contract', id_proof: 'Identity Document', certificate: 'Certificate', resume: 'Resume', other: 'Document' };

const TYPE_IMAGE = {
  contract: '/Digital_ecosystem_with_data_streams_202607161152.jpeg',
  certificate: '/Digital_knowledge_hub_background._2K_202607162000.jpeg',
  id_proof: '/Technology_visualization_digital._2K_202607161306.jpeg',
  resume: '/Industries_connected_by_digital_._202607161411.jpeg',
  other: '/Digital_storytelling_enterprise_._2K_202607162007.jpeg',
};

const TYPE_CONTENT = {
  contract: {
    intro: (name) => `This ${name} is an official agreement between CoreFusion Technologies and the employee. Please review the terms below and retain a copy for your records.`,
    sections: [
      { heading: '1. Position & Responsibilities', content: 'The employee will perform the duties and responsibilities assigned by their reporting manager. The role may evolve over time as business needs change.' },
      { heading: '2. Compensation & Benefits', table: { headers: ['Component', 'Details'], rows: [['Base Salary', 'As per the approved offer, paid monthly'], ['Variable Pay', 'Linked to individual and company performance'], ['Benefits', 'Health insurance, provident fund, and leave entitlements']] } },
      { heading: '3. Term & Notice Period', content: 'The contract is effective from the date of joining and continues until terminated by either party in accordance with the applicable notice period.' },
      { heading: '4. Confidentiality & IP', content: 'The employee agrees to keep company information confidential and to assign all intellectual property created during employment to the company.' },
      { heading: '5. Acceptance', content: 'By continuing employment, the employee accepts the terms and conditions described in this document.' },
    ],
  },
  certificate: {
    intro: (name) => `This ${name} is awarded to certify the successful completion of the program described below.`,
    sections: [
      { heading: 'Certificate Details', table: { headers: ['Field', 'Value'], rows: [['Certificate ID', 'CERT-2026-0087'], ['Recipient', '[Employee Name]'], ['Program', 'Professional Development Program'], ['Duration', '120 hours'], ['Completion Date', new Date().toISOString().slice(0, 10)], ['Issued By', 'CoreFusion Technologies Learning & Development']] } },
      { heading: 'Competencies Acquired', content: 'The recipient has demonstrated proficiency in the core competencies covered by the program, including practical application, collaboration, and continuous learning.' },
      { heading: 'Verification', content: 'This certificate can be verified by contacting the Human Resources team at CoreFusion Technologies.' },
    ],
  },
  id_proof: {
    intro: (name) => `This document records the ${name} submitted by the employee as proof of identity for onboarding and compliance purposes.`,
    sections: [
      { heading: 'Document Details', table: { headers: ['Field', 'Value'], rows: [['Document', '[Document Type]'], ['Document Number', '[XXXX-XXXX]'], ['Date of Issue', '[DD/MM/YYYY]'], ['Status', 'Verified']] } },
      { heading: 'Purpose', content: 'The document is retained in the employee record for KYC, tax, and compliance verification. It is stored securely and accessed only by authorized personnel.' },
      { heading: 'Privacy Note', content: 'Personal information is processed in accordance with applicable data protection laws and is never shared with third parties without consent.' },
    ],
  },
  resume: {
    intro: (name) => `Professional profile for ${name}, summarizing experience, skills, and qualifications relevant to the role at CoreFusion Technologies.`,
    sections: [
      { heading: 'Professional Summary', content: 'A results-driven professional with a strong record of delivering high-quality work, collaborating across teams, and contributing to business outcomes.' },
      { heading: 'Skills', table: { headers: ['Category', 'Skills'], rows: [['Technical', 'Software development, cloud platforms, data analysis'], ['Functional', 'Communication, problem solving, stakeholder management']] } },
      { heading: 'Experience', content: 'Progressive experience across roles with increasing responsibility, supported by measurable achievements and peer recognition.' },
      { heading: 'Education', content: 'Relevant academic qualifications as recorded in the employee profile.' },
    ],
  },
  other: {
    intro: (name) => `This ${name} is an official document issued by CoreFusion Technologies. Key details and instructions are provided below.`,
    sections: [
      { heading: 'Key Details', table: { headers: ['Field', 'Value'], rows: [['Document', name], ['Issued To', '[Employee Name]'], ['Issue Date', new Date().toISOString().slice(0, 10)], ['Status', 'Valid']] } },
      { heading: 'Purpose', content: 'This document confirms the details communicated to the employee and serves as an official record within the organization.' },
      { heading: 'Contact', content: 'For any questions or corrections regarding this document, please contact the Human Resources team at CoreFusion Technologies.' },
    ],
  },
};

function loadImageData(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function downloadDocumentPdf(doc) {
  const pdf = await buildDocumentPdf(doc);
  const safeName = String(doc.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.pdf$/i, '') + '.pdf';
  pdf.save(safeName);
}

export async function buildDocumentPdf(doc) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;

  const [logoData, imageData] = await Promise.all([loadImageData('/logo.jpeg'), loadImageData(TYPE_IMAGE[doc.type] || TYPE_IMAGE.other)]);

  const type = TYPE_LABEL[doc.type] || TYPE_LABEL.other;
  const template = TYPE_CONTENT[doc.type] || TYPE_CONTENT.other;
  const docName = String(doc.name || 'Document');

  const checkPage = (needed) => {
    if (pdf.internal.getCurrentPageInfo().pageHeight - 25 < needed) {
      pdf.addPage();
      return margin;
    }
    return 0;
  };

  let cursor = margin;
  const drawFooter = (pageNum) => {
    pdf.setPage(pageNum);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text('CoreFusion Technologies  |  Confidential', margin, pageH - 10);
    pdf.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: 'right' });
  };

  pdf.setFillColor(...BRAND_DARK);
  pdf.rect(0, 0, pageW, 32, 'F');
  if (logoData) {
    try {
      pdf.addImage(logoData, 'JPEG', margin, 8, 16, 16);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(...WHITE);
      pdf.text('CoreFusion Technologies', margin + 20, 15);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...CYAN);
      pdf.text(type.toUpperCase(), margin + 20, 23);
    } catch {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(...WHITE);
      pdf.text('CoreFusion Technologies', margin, 15);
    }
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...WHITE);
    pdf.text('CoreFusion Technologies', margin, 15);
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...CYAN);
  pdf.text('Employee Documents', pageW - margin, 15, { align: 'right' });

  cursor = 48;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(...BRAND_DARK);
  const titleLines = pdf.splitTextToSize(docName, contentW);
  titleLines.forEach((line) => {
    pdf.text(line, pageW / 2, cursor, { align: 'center' });
    cursor += 9;
  });
  cursor += 4;

  pdf.setFillColor(...CYAN);
  pdf.rect((pageW - 60) / 2, cursor, 60, 2, 'F');
  cursor += 10;

  const metaRows = [
    ['Document ID', doc.id || 'N/A'],
    ['Type', type],
    ['Uploaded', doc.uploadedOn || 'N/A'],
  ];
  if (doc.size) metaRows.push(['Size', doc.size]);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...BRAND_DARK);
  pdf.text('Document Details', margin, cursor);
  cursor += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  metaRows.forEach(([k, v], i) => {
    const rowY = cursor;
    if (i % 2 === 0) {
      pdf.setFillColor(247, 249, 251);
      pdf.rect(margin, rowY - 4, contentW, 8, 'F');
    }
    pdf.setTextColor(...MUTED);
    pdf.text(String(k), margin + 4, rowY);
    pdf.setTextColor(...INK);
    pdf.text(String(v), margin + 60, rowY);
    cursor += 8;
  });
  cursor += 6;

  if (imageData) {
    try {
      const imgH = 52;
      pdf.addImage(imageData, 'JPEG', margin, cursor, contentW, imgH);
      cursor += imgH + 8;
    } catch {
      // image failed to embed — continue without it
    }
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...MUTED);
  const introLines = pdf.splitTextToSize(template.intro(docName), contentW);
  introLines.forEach((line) => {
    cursor += checkPage(5);
    pdf.text(line, margin, cursor);
    cursor += 5;
  });
  cursor += 6;

  template.sections.forEach((s) => {
    cursor += checkPage(16);
    cursor += 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(...BRAND);
    pdf.text(String(s.heading), margin, cursor);
    cursor += 6;

    if (s.content) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...INK);
      const lines = pdf.splitTextToSize(String(s.content), contentW);
      lines.forEach((line) => {
        cursor += checkPage(5);
        pdf.text(line, margin, cursor);
        cursor += 5;
      });
      cursor += 4;
    }

    if (s.table) {
      const colW = contentW / s.table.headers.length;
      const rowH = 7;
      cursor += checkPage((s.table.rows.length + 1) * rowH + 4);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...WHITE);
      pdf.setFillColor(...BRAND);
      pdf.rect(margin, cursor - 5, contentW, rowH, 'F');
      s.table.headers.forEach((h, ci) => {
        pdf.text(String(h), margin + ci * colW + 3, cursor);
      });
      cursor += rowH;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      s.table.rows.forEach((row, ri) => {
        cursor += checkPage(rowH + 2);
        if (ri % 2 === 0) {
          pdf.setFillColor(247, 249, 251);
          pdf.rect(margin, cursor - 5, contentW, rowH, 'F');
        }
        pdf.setTextColor(...INK);
        row.forEach((cell, ci) => {
          pdf.text(String(cell), margin + ci * colW + 3, cursor);
        });
        cursor += rowH;
      });
      cursor += 4;
    }
  });

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    drawFooter(i);
  }

  return pdf;
}