export default function BlogHero() {
  return (
    <section
      className="relative bg-brand-dark text-white pt-32 pb-section-padding overflow-hidden"
      style={{ backgroundImage: 'url(/Digital_knowledge_hub_background…_2K_202607162000.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-brand-dark/60" />
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan animate-hero-1 block">Blog</span>
          <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6 animate-hero-2">
            Insights from the Engineering Frontline
          </h1>
          <p className="text-body-lg text-white/80 max-w-2xl animate-hero-3">
            Deep dives, practical guides, and thought leadership from our team of engineers,
            architects, and industry experts.
          </p>
        </div>
      </div>
    </section>
  );
}
