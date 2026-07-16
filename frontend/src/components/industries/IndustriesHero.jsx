export default function IndustriesHero() {
  return (
    <section className="relative bg-brand-dark text-white pt-32 pb-section-padding overflow-hidden">
      <img
        src="/Industries_connected_by_digital_…_202607161411.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan animate-hero-1 block">Industries</span>
          <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6 animate-hero-2">
            Deep Industry Knowledge, Applied
          </h1>
          <p className="text-body-lg text-white/80 max-w-2xl animate-hero-3">
            We combine technical excellence with deep domain expertise across key industries,
            delivering solutions that address sector-specific challenges and regulatory requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
