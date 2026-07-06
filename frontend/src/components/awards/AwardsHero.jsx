import Reveal from '../ui/Reveal.jsx';

export default function AwardsHero() {
  return (
    <section className="bg-brand-dark text-white pt-32 pb-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="max-w-3xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Awards</span>
            <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6">
              Recognized for Excellence
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">
              Our commitment to quality, innovation, and security has been recognized by leading industry bodies and analysts worldwide.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
