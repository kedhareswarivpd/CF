import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { downloads } from '../data/downloads.js';

export default function DownloadDetail() {
  const { slug } = useParams();

  const item = useMemo(() => downloads.find((d) => d.id === slug), [slug]);

  if (!item) {
    return (
      <section className="min-h-screen bg-surface-white dark:bg-dark-surface px-margin-mobile md:px-margin-desktop py-section-padding">
        <div className="max-w-container mx-auto rounded-3xl border border-outline-variant bg-white p-8">
          <h1 className="font-display text-display-md text-brand mb-4">Download not found</h1>
          <p className="text-ink-muted">The requested document could not be found.</p>
        </div>
      </section>
    );
  }

  const handleDownload = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 36;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 130, 'F');
    doc.setTextColor(248, 250, 252);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, margin, 58);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(item.intro, margin, 84, { maxWidth: pageWidth - margin * 2 });

    let y = 160;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Highlights', margin, y);
    y += 18;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    item.highlights.forEach((line) => {
      doc.text(`• ${line}`, margin + 8, y);
      y += 16;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Capabilities', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    item.capabilities.forEach((cap) => {
      doc.text(`${cap.title}: ${cap.description}`, margin + 8, y);
      y += 16;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Why it matters', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.text(item.footer, margin + 8, y, { maxWidth: pageWidth - margin * 2 - 16 });

    doc.save(`${slug}.pdf`);
  };

  return (
    <section className="min-h-screen bg-surface-white dark:bg-dark-surface px-margin-mobile md:px-margin-desktop py-section-padding">
      <div className="max-w-container mx-auto overflow-hidden rounded-[2rem] border border-outline-variant bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 md:p-12 lg:p-16">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan mb-4">{item.category}</p>
            <h1 className="font-display text-display-md-mobile md:text-display-md text-brand mb-6">{item.title}</h1>
            <p className="text-body-lg text-ink-muted leading-relaxed max-w-2xl mb-8">{item.intro}</p>
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white hover:bg-brand-dark transition-colors"
              >
                Download PDF
              </button>
              <Link to="/downloads" className="inline-flex items-center justify-center rounded-full border border-outline-variant px-6 py-3 font-label-caps text-label-caps uppercase text-ink-muted hover:border-brand hover:text-brand transition-colors">
                Back to Downloads
              </Link>
            </div>

            <div className="rounded-2xl bg-surface-container p-6">
              <h2 className="font-display text-headline-sm text-ink mb-4">Highlights</h2>
              <ul className="space-y-3 text-ink-muted">
                {item.highlights.map((line) => (
                  <li key={line} className="flex items-start gap-3"><span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent-cyan" /><span>{line}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative min-h-[320px] md:min-h-[480px] bg-surface-container">
            <img src="/brochure-hero.svg" alt={item.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/20 to-transparent" />
          </div>
        </div>

        <div className="grid gap-6 border-t border-outline-variant bg-surface-white/80 p-8 md:p-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan mb-3">Why it matters</p>
            <h2 className="font-display text-headline-md text-ink mb-4">A practical, outcome-driven document for your team.</h2>
            <p className="text-body-md text-ink-muted leading-relaxed">{item.footer}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {item.capabilities.map((cap) => (
              <div key={cap.title} className="rounded-2xl border border-outline-variant bg-white p-5">
                <h3 className="font-display text-headline-sm text-ink mb-2">{cap.title}</h3>
                <p className="text-body-sm text-ink-muted leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
