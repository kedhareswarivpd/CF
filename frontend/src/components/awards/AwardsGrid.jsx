import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function AwardsGrid({ awards, yearFilters }) {
  if (!awards) return <LoadingSpinner />;
  if (!awards.length) return <EmptyState icon="trophy" title="No awards found" description="No awards to display." />;
  const [activeYear, setActiveYear] = useState('All');

  const filtered = activeYear === 'All'
    ? awards
    : awards.filter((a) => a.year === activeYear);

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {yearFilters.map((y) => (
            <button
              key={y}
              onClick={() => setActiveYear(y)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeYear === y
                  ? 'bg-brand text-white'
                  : 'bg-surface-container dark:bg-dark-surface-container text-ink-muted dark:text-dark-ink-muted hover:bg-outline-variant dark:hover:bg-dark-outline-variant'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filtered.map((award) => (
            <Reveal key={award.title}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-status-warning-bg flex items-center justify-center">
                    <Icon name="trophy" className="text-status-warning-text text-2xl" />
                  </div>
                  <span className="font-stat text-stat-lg text-brand">{award.year}</span>
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-2">{award.title}</h3>
                <p className="font-label-caps text-label-caps uppercase text-ink-muted mb-3">{award.issuedBy}</p>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted flex-1">{award.description}</p>
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <StatusBadge variant="warning">{award.category}</StatusBadge>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
