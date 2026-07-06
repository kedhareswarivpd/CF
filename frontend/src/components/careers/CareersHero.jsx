import Reveal from '../ui/Reveal.jsx';

export default function CareersHero() {
  return (
    <section className="bg-brand-dark text-white pt-32 pb-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="max-w-3xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Careers</span>
            <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6">
              Build the Future With Us
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">
              Join a global team of engineers, designers, and problem-solvers who are shaping the
              next generation of enterprise technology across 18+ countries.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
