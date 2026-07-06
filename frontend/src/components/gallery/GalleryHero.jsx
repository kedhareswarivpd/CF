import Reveal from '../ui/Reveal.jsx';

export default function GalleryHero() {
  return (
    <section className="bg-brand-dark text-white pt-32 pb-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="max-w-3xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Gallery</span>
            <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6">
              Moments That Define Us
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">
              A visual journey through our events, culture, and the people who make CoreFusion what it is.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
