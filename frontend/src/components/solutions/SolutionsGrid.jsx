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
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <Reveal key={s.title} from="zoom" delay={i * 80}>
              <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-accent-cyan-pale">
                  <Icon name={s.icon} className="text-2xl text-brand" />
                </div>
                <h3 className="mb-3 min-h-16 font-display text-headline-sm text-black dark:text-white">{s.title}</h3>
                <p className="mb-4 min-h-24 text-body-md text-black dark:text-white">{s.description}</p>
                <ul className="mb-4 space-y-2">
                  {s.capabilities.slice(0, 4).map((cap) => (
                    <li key={cap} className="flex items-start gap-2 text-body-sm text-black dark:text-white">
                      <Icon name="check_circle" className="mt-0.5 flex-shrink-0 text-lg text-brand" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 border-t border-outline-variant pt-4">
                  {s.industries.map((ind) => (
                    <StatusBadge key={ind} variant="neutral" className="!text-black">{ind}</StatusBadge>
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
