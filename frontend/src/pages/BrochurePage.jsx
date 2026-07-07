import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const highlights = [
  'Enterprise software engineering and platform modernization',
  'Cloud, AI, and data-driven transformation programs',
  'Security-first digital journeys and resilient architecture',
  'Global delivery partnerships and measurable outcomes',
];

const capabilities = [
  { title: 'Digital Engineering', description: 'Custom products, automation platforms, and cloud-native solutions built for scale.' },
  { title: 'AI & Data', description: 'Advanced analytics, automation, and intelligent workflows that improve decision-making.' },
  { title: 'Cybersecurity', description: 'Zero-trust foundations, compliance frameworks, and proactive protection strategies.' },
];

export default function BrochurePage() {
  const brochureRef = useRef(null);

  const handleDownload = () => {
    if (!brochureRef.current) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    const input = brochureRef.current;

    doc.html(input, {
      callback: (pdf) => pdf.save('corefusion-corporate-brochure.pdf'),
      x: 20,
      y: 20,
      width: 555,
      windowWidth: 1200,
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
    });
  };

  return (
    <section className="min-h-screen bg-surface-white dark:bg-dark-surface px-margin-mobile md:px-margin-desktop py-section-padding">
      <div ref={brochureRef} className="max-w-container mx-auto overflow-hidden rounded-[2rem] border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface-container shadow-sm">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-12 lg:p-16">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan mb-4">
              Corporate Brochure 2026
            </p>
            <h1 className="font-display text-display-md-mobile md:text-display-md text-brand dark:text-dark-brand mb-6">
              Engineering resilient digital futures for ambitious enterprises.
            </h1>
            <p className="text-body-lg text-ink-muted dark:text-dark-ink-muted leading-relaxed max-w-2xl mb-8">
              CoreFusion partners with global organizations to design, build, and operate secure digital platforms that unlock efficiency, resilience, and growth.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white hover:bg-brand-dark transition-colors"
              >
                Download PDF
              </button>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-outline-variant px-6 py-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted hover:border-brand hover:text-brand transition-colors">
                Talk to us
              </Link>
            </div>

            <div className="rounded-2xl bg-surface-container dark:bg-dark-surface p-6">
              <h2 className="font-display text-headline-sm text-ink dark:text-dark-ink mb-4">What you’ll find inside</h2>
              <ul className="space-y-3 text-ink-muted dark:text-dark-ink-muted">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative min-h-[320px] md:min-h-[480px]">
            <img
              src="/brochure-hero.svg"
              alt="CoreFusion engineering team collaborating"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/20 to-transparent" />
          </div>
        </div>

        <div className="grid gap-6 border-t border-outline-variant dark:border-dark-outline-variant bg-surface-white/70 dark:bg-dark-surface/70 p-8 md:p-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan mb-3">Why clients choose us</p>
            <h2 className="font-display text-headline-md text-ink dark:text-dark-ink mb-4">From concept to execution, with measurable impact.</h2>
            <p className="text-body-md text-ink-muted dark:text-dark-ink-muted leading-relaxed">
              We combine strategic consulting, product engineering, and operational excellence to deliver secure, scalable solutions that create lasting value.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => (
              <div key={item.title} className="rounded-2xl border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface-container p-5">
                <h3 className="font-display text-headline-sm text-ink dark:text-dark-ink mb-2">{item.title}</h3>
                <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant dark:border-dark-outline-variant p-8 md:px-12 md:py-10">
          <div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan mb-2">Ready to explore</p>
            <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">See how CoreFusion can support your next transformation initiative.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/downloads" className="text-brand dark:text-dark-brand hover:underline">
              Back to Downloads
            </Link>
            <Link to="/contact" className="text-brand dark:text-dark-brand hover:underline">
              Request a consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
