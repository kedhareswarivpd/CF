import Reveal from '../ui/Reveal.jsx';

const IMPACTS = [
  { value: '430+', label: 'Projects Delivered', icon: 'rocket_launch', desc: 'Enterprise-grade solutions shipped on time and on budget across industries.' },
  { value: '285+', label: 'Engineers & Specialists', icon: 'groups', desc: 'A deep bench of AI, cloud, cybersecurity, and enterprise architecture experts.' },
  { value: '18+', label: 'Countries Served', icon: 'public', desc: 'Delivery hubs and client engagements spanning six continents.' },
  { value: '99.8%', label: 'Uptime SLA', icon: 'verified', desc: 'Round-the-clock monitoring and L1–L3 support across every time zone.' },
  { value: '5+', label: 'Years of Excellence', icon: 'emoji_events', desc: 'ISO 9001 & 27001 certified. Independently audited quality and security management.' },
  { value: '3x', label: 'Avg. ROI for Clients', icon: 'trending_up', desc: 'Measurable business outcomes delivered through precision engineering.' },
];

export default function ImpactStats() {
  return (
    <section id="our-impact" className="bg-surface-low py-section-padding dark:bg-dark-surface-low">
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop">
        <Reveal from="up" className="mb-stack-xl text-center">
          <span className="mb-3 block font-label-caps text-label-caps uppercase text-brand">Our Impact</span>
          <h2 className="font-display text-headline-md text-white">
            Numbers that define our journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-white">
            Five years of high-performance delivery for enterprises that can&apos;t afford downtime.
          </p>
        </Reveal>
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {IMPACTS.map((item, i) => (
            <Reveal key={item.label} from="zoom" delay={i * 80}>
              <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover dark:bg-dark-surface">
                <div className="flex size-12 items-center justify-center rounded-lg bg-accent-cyan-pale">
                  <span className="material-symbols-outlined text-2xl text-brand">{item.icon}</span>
                </div>
                <div className="font-stat text-4xl font-bold text-brand-dark dark:text-dark-brand">{item.value}</div>
                <div>
                  <p className="mb-1 font-display text-headline-sm font-semibold text-brand-dark dark:text-dark-brand">{item.label}</p>
                  <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
