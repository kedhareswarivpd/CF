import Reveal from '../ui/Reveal.jsx';

export default function LegalContent({ content }) {
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="mb-stack-lg">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-brand">
                Last Updated: {content.lastUpdated}
              </span>
              <h1 className="font-display text-headline-lg text-brand-dark mt-2">{content.title}</h1>
            </div>
          </Reveal>
          <div className="space-y-stack-lg">
            {content.sections.map((section) => (
              <Reveal key={section.title}>
                <div>
                  <h2 className="font-display text-headline-sm text-brand-dark mb-3">{section.title}</h2>
                  <p className="text-body-md text-ink-muted leading-relaxed">{section.content}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
