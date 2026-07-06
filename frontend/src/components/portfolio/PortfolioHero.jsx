export default function PortfolioHero() {
  return (
    <section className="relative bg-brand py-stack-xl px-margin-mobile md:px-margin-desktop overflow-hidden">
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="relative z-10 max-w-container mx-auto grid md:grid-cols-2 gap-stack-lg items-center">
        <div className="flex flex-col gap-stack-md">
          <span className="font-label-caps text-label-caps uppercase text-accent-cyan animate-hero-1">Project Portfolio</span>
          <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-white animate-hero-2">
            Success Delivered: 430+ Projects Globally
          </h1>
          <p className="font-body text-body-lg text-surface-dim max-w-xl opacity-90 animate-hero-3">
            We engineer high-performance digital ecosystems for global leaders, transforming complex
            challenges into elegant technological triumphs.
          </p>
          <div className="flex gap-4 mt-4 animate-hero-4">
            <div className="flex flex-col">
              <span className="font-stat text-4xl text-white">18+</span>
              <span className="font-label-caps text-label-caps uppercase text-surface-dim opacity-70">
                Countries Served
              </span>
            </div>
            <div className="w-px h-12 bg-white/20 self-center mx-4" />
            <div className="flex flex-col">
              <span className="font-stat text-4xl text-white">98%</span>
              <span className="font-label-caps text-label-caps uppercase text-surface-dim opacity-70">
                Client Retention
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex justify-end animate-hero-panel">
          <div className="glass-panel p-8 rounded-lg w-full max-w-md animate-float">
            <div className="flex justify-between items-center mb-6">
              <span className="font-label-caps text-label-caps uppercase text-white">Real-time Pipeline</span>
              <span className="flex items-center gap-2 text-accent-cyan font-bold text-sm">
                <span className="w-2 h-2 bg-accent-cyan rounded-full animate-ping" /> LIVE
              </span>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-accent-cyan rounded-full shimmer-bar" />
              </div>
              <div className="flex justify-between font-label-caps text-label-caps uppercase text-surface-dim">
                <span>Active Deployments</span>
                <span>24 Units</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-accent-cyan/70 rounded-full" style={{ animation: 'shimmer-bar 1.4s cubic-bezier(0.22,1,0.36,1) 0.9s both', width: 0 }} />
              </div>
              <div className="flex justify-between font-label-caps text-label-caps uppercase text-surface-dim">
                <span>Security Audits</span>
                <span>12 Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
