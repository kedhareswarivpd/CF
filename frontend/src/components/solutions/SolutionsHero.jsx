export default function SolutionsHero() {
  return (
    <section className="relative bg-brand-dark text-white pt-32 pb-section-padding overflow-hidden">
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan animate-hero-1 block">What We Deliver</span>
          <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6 animate-hero-2">
            Enterprise Solutions That Drive Transformation
          </h1>
          <p className="text-body-lg text-white/80 max-w-2xl animate-hero-3">
            From cloud migration to AI-powered analytics, our comprehensive suite of solutions helps enterprises
            modernize, secure, and scale their operations in an increasingly digital world.
          </p>
        </div>
      </div>
    </section>
  );
}
