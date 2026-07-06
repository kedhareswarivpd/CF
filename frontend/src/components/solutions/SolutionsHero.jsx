import Reveal from '../ui/Reveal.jsx';

export default function SolutionsHero() {
  return (
    <section className="bg-brand-dark text-white pt-32 pb-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="max-w-3xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">What We Deliver</span>
            <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6">
              Enterprise Solutions That Drive Transformation
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">
              From cloud migration to AI-powered analytics, our comprehensive suite of solutions helps enterprises
              modernize, secure, and scale their operations in an increasingly digital world.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
