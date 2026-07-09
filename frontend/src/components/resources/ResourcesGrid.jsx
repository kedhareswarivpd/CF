import { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function ResourcesGrid({ resources, typeFilters }) {
  if (!resources) return <LoadingSpinner />;
  if (!resources.length) return <EmptyState icon="menu_book" title="No resources found" description="Resources will appear here." />;
  const [activeType, setActiveType] = useState('All');

  const filtered = activeType === 'All'
    ? resources
    : resources.filter((r) => r.resourceType === activeType);

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeType === t
                  ? 'bg-brand text-white'
                  : 'bg-surface-container dark:bg-dark-surface-container text-ink-muted dark:text-dark-ink-muted hover:bg-outline-variant dark:hover:bg-dark-outline-variant'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-gutter">
          {filtered.map((r, i) => (
            <Reveal key={r.slug} from="zoom" delay={i * 80}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-cyan-pale flex items-center justify-center flex-shrink-0">
                    <Icon name="menu_book" className="text-brand text-xl" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {r.featured && <StatusBadge variant="warning">Featured</StatusBadge>}
                    <Badge className="bg-accent-cyan-pale text-brand text-label-caps">{r.resourceType}</Badge>
                  </div>
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-2">{r.title}</h3>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{r.description}</p>
                <div className="flex items-center gap-4 text-body-sm text-ink-muted dark:text-dark-ink-muted pt-4 border-t border-outline-variant dark:border-dark-outline-variant">
                  <div className="flex items-center gap-1.5">
                    <Icon name="person" className="text-brand text-lg" />
                    <span>{r.author}</span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Icon name="schedule" className="text-brand text-lg" />
                    {r.readTime}
                  </span>
                  <span className="ml-auto text-label-caps text-label-caps">{r.publishedAt}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {r.topics.map((t) => (
                    <StatusBadge key={t} variant="neutral" className="dark:!text-black">{t}</StatusBadge>
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
