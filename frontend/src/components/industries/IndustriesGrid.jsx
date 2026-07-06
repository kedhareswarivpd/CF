import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function IndustriesGrid({ industries }) {
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {industries.map((ind, i) => (
            <Reveal key={ind.title} from="zoom" delay={i * 80}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-accent-cyan-pale flex items-center justify-center mb-4">
                  <Icon name={ind.icon} className="text-brand text-2xl" />
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-3">{ind.title}</h3>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{ind.description}</p>
                <div className="mb-4">
                  <h4 className="font-label-caps text-label-caps uppercase text-ink-muted mb-2">Key Challenges</h4>
                  <ul className="space-y-1.5">
                    {ind.challenges.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-body-sm text-ink-muted">
                        <Icon name="chevron_right" className="text-brand text-lg flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-outline-variant">
                  <p className="text-body-sm text-brand font-semibold italic">{ind.stats}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
