import Reveal from '../ui/Reveal.jsx';

export default function LegalContent({ content }) {
  return (
    <section className="py-section-padding">
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mb-stack-lg">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-brand">
                Last Updated: {content.lastUpdated}
              </span>
              <h1 className="mt-2 font-display text-headline-lg text-brand-dark">{content.title}</h1>
            </div>
          </Reveal>
          <div className="space-y-stack-lg">
            {content.sections.map((section) => (
              <Reveal key={section.title}>
                <div>
                  <h2 className="mb-3 font-display text-headline-sm text-brand-dark">{section.title}</h2>
                  <p className="text-body-md leading-relaxed text-ink-muted">{section.content}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
