import Reveal from '../ui/Reveal.jsx';

export default function IndustriesHero() {
  return (
    <section className="bg-brand-dark text-white pt-32 pb-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="max-w-3xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Industries</span>
            <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6">
              Deep Industry Knowledge, Applied
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">
              We combine technical excellence with deep domain expertise across key industries,
              delivering solutions that address sector-specific challenges and regulatory requirements.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
