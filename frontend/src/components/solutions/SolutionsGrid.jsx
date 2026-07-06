import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function SolutionsGrid({ solutions }) {
  if (!solutions) return <LoadingSpinner />;
  if (!solutions.length) return <EmptyState icon="cloud" title="No solutions listed" description="Solutions will appear here." />;
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {solutions.map((s, i) => (
            <Reveal key={s.title}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-accent-cyan-pale flex items-center justify-center mb-4">
                  <Icon name={s.icon} className="text-brand text-2xl" />
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-3">{s.title}</h3>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{s.description}</p>
                <ul className="space-y-2 mb-4">
                  {s.capabilities.slice(0, 4).map((cap) => (
                    <li key={cap} className="flex items-start gap-2 text-body-sm text-ink-muted">
                      <Icon name="check_circle" className="text-brand text-lg flex-shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant">
                  {s.industries.map((ind) => (
                    <StatusBadge key={ind} variant="neutral">{ind}</StatusBadge>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
