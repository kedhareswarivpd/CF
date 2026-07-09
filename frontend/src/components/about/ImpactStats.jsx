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
    <section id="our-impact" className="py-section-padding bg-surface-low dark:bg-dark-surface-low">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal from="up" className="text-center mb-stack-xl">
          <span className="font-label-caps text-label-caps uppercase text-brand block mb-3">Our Impact</span>
          <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">
            Numbers that define our journey
          </h2>
          <p className="text-body-lg text-ink-muted dark:text-dark-ink-muted mt-4 max-w-2xl mx-auto">
            Five years of high-performance delivery for enterprises that can't afford downtime.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {IMPACTS.map((item, i) => (
            <Reveal key={item.label} from="zoom" delay={i * 80}>
              <div className="bg-white dark:bg-dark-surface rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent-cyan-pale flex items-center justify-center">
                  <span className="material-symbols-outlined text-brand text-2xl">{item.icon}</span>
                </div>
                <div className="font-stat text-4xl font-bold text-brand-dark dark:text-dark-brand">{item.value}</div>
                <div>
                  <p className="font-display font-semibold text-headline-sm text-brand-dark dark:text-dark-brand mb-1">{item.label}</p>
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
