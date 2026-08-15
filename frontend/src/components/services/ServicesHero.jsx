import Badge from '../ui/Badge.jsx';

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-surface-white px-margin-mobile py-section-padding md:px-margin-desktop">
      <div className="animate-float-slow pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="mx-auto grid max-w-container items-center gap-stack-lg md:grid-cols-2">
        <div className="flex flex-col gap-stack-md">
          <Badge className="animate-hero-1 w-fit bg-accent-cyan-pale text-brand">High-Performance Engineering</Badge>
          <h1 className="animate-hero-2 font-display text-display-lg-mobile text-ink md:text-display-lg">Our Technology Offerings</h1>
          <p className="animate-hero-3 max-w-xl font-body text-body-lg text-white">
            Engineered for scale, security, and velocity. We bridge the gap between complex enterprise needs
            and cutting-edge digital implementation.
          </p>
        </div>
        <div className="animate-hero-panel hidden md:block">
          <div className="glass-panel-light animate-float flex flex-col gap-stack-md rounded-lg p-stack-lg">
            <div className="flex items-center justify-between border-b border-outline-variant pb-stack-sm">
              <span className="font-label-caps text-label-caps uppercase text-white">Real-time Delivery Metrics</span>
              <span className="material-symbols-outlined text-white">bolt</span>
            </div>
            <div className="grid grid-cols-2 gap-stack-md">
              <div>
                <p className="font-display text-headline-lg text-white">
                  99.9<span className="text-accent-cyan">%</span>
                </p>
                <p className="font-label-caps text-label-caps uppercase text-white">Uptime SLA</p>
              </div>
              <div>
                <p className="font-display text-headline-lg text-white">24/7</p>
                <p className="font-label-caps text-label-caps uppercase text-white">Global Monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
