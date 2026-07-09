import { aboutStats } from '../../data/about.js';

export default function AboutHero({ stats }) {
  const items = stats
    ? [
        { value: `${stats.total_clients}+`, label: 'Global Clients' },
        { value: `${stats.total_employees}+`, label: 'Engineers & Specialists' },
        { value: `${stats.total_projects}+`, label: 'Projects Delivered' },
        { value: `${stats.countries}+`, label: 'Countries Served' },
      ]
    : aboutStats;
  return (
    <section className="relative min-h-[620px] flex items-center overflow-hidden bg-white dark:bg-dark-surface">
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-accent-cyan/10 blur-2xl animate-float pointer-events-none" />
      <div className="relative z-10 max-w-container mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-stack-lg items-center py-20">
        <div>
          <span className="font-label-caps text-label-caps uppercase text-accent-cyan mb-4 block animate-hero-1">
            Engineering the Future
          </span>
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-brand-dark dark:text-dark-brand mb-6 animate-hero-2">
            Innovating at the Core of <span className="text-brand">Global Scale</span>
          </h1>
          <p className="text-ink-muted font-body text-body-lg mb-stack-lg max-w-xl animate-hero-3">
            CoreFusion Technologies is a global engineering powerhouse focused on driving digital
            transformation through precise technical excellence and strategic innovation.
          </p>
          <div className="flex gap-4 animate-hero-4">
            <button
              onClick={() => document.getElementById('our-impact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand text-white h-11 px-8 rounded font-label-caps text-label-caps uppercase flex items-center hover:opacity-90 transition-colors"
            >
              Our Impact
            </button>
            <button
              onClick={() => document.getElementById('global-offices')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-brand text-brand h-11 px-8 rounded font-label-caps text-label-caps uppercase flex items-center hover:bg-brand hover:text-white transition-colors"
            >
              View Global Offices
            </button>
          </div>
        </div>
        <div className="hidden md:block animate-hero-panel">
          <div className="glass-panel p-8 rounded-lg animate-float">
            <div className="grid grid-cols-2 gap-8">
              {items.map((stat) => (
                <div key={stat.label} className="animate-count-in">
                  <div className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{stat.value}</div>
                  <div className="font-label-caps text-label-caps uppercase text-ink-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
