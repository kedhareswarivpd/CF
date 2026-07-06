export default function GalleryHero() {
  return (
    <section className="relative bg-brand-dark text-white pt-32 pb-section-padding overflow-hidden">
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan animate-hero-1 block">Gallery</span>
          <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6 animate-hero-2">
            Moments That Define Us
          </h1>
          <p className="text-body-lg text-white/80 max-w-2xl animate-hero-3">
            A visual journey through our events, culture, and the people who make CoreFusion what it is.
          </p>
        </div>
      </div>
    </section>
  );
}
