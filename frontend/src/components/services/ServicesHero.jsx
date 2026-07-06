import Badge from '../ui/Badge.jsx';

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-surface-white py-section-padding px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container mx-auto grid md:grid-cols-2 gap-stack-lg items-center">
        <div className="flex flex-col gap-stack-md">
          <Badge className="bg-accent-cyan-pale text-brand w-fit">High-Performance Engineering</Badge>
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-ink">Our Technology Offerings</h1>
          <p className="font-body text-body-lg text-ink-muted max-w-xl">
            Engineered for scale, security, and velocity. We bridge the gap between complex enterprise needs
            and cutting-edge digital implementation.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="glass-panel-light p-stack-lg rounded-lg flex flex-col gap-stack-md">
            <div className="flex items-center justify-between border-b border-outline-variant pb-stack-sm">
              <span className="font-label-caps text-label-caps uppercase text-brand">Real-time Delivery Metrics</span>
              <span className="material-symbols-outlined text-brand">bolt</span>
            </div>
            <div className="grid grid-cols-2 gap-stack-md">
              <div>
                <p className="font-display text-headline-lg text-ink">
                  99.9<span className="text-brand">%</span>
                </p>
                <p className="font-label-caps text-label-caps uppercase text-ink-muted">Uptime SLA</p>
              </div>
              <div>
                <p className="font-display text-headline-lg text-ink">24/7</p>
                <p className="font-label-caps text-label-caps uppercase text-ink-muted">Global Monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
