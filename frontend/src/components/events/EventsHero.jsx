export default function EventsHero() {
  return (
    <section className="relative bg-brand-dark text-white pt-32 pb-section-padding overflow-hidden">
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan animate-hero-1 block">Events</span>
          <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6 animate-hero-2">
            Connect, Learn, and Innovate
          </h1>
          <p className="text-body-lg text-white/80 max-w-2xl animate-hero-3">
            Join us at conferences, workshops, webinars, and hackathons around the world. Explore upcoming events and connect with our team.
          </p>
        </div>
      </div>
    </section>
  );
}
