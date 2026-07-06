import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function DownloadsGrid({ downloads, categoryFilters }) {
  if (!downloads) return <LoadingSpinner />;
  if (!downloads.length) return <EmptyState icon="download" title="No downloads available" description="No resources to download." />;
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? downloads
    : downloads.filter((d) => d.category === activeCategory);

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-surface-container text-ink-muted hover:bg-outline-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filtered.map((d, i) => (
            <Reveal key={d.title} from="zoom" delay={i * 80}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-status-error-bg flex items-center justify-center">
                    <Icon name="description" className="text-status-error-text text-xl" />
                  </div>
                  <StatusBadge variant="neutral">{d.format}</StatusBadge>
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-2">{d.title}</h3>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{d.description}</p>
                <div className="flex items-center gap-4 text-body-sm text-ink-muted dark:text-dark-ink-muted pt-4 border-t border-outline-variant dark:border-dark-outline-variant mb-4">
                  <span className="flex items-center gap-1">
                    <Icon name="folder" className="text-brand text-lg" />
                    {d.category}
                  </span>
                  <span>{d.fileSize}</span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Icon name="download" className="text-lg" />
                    {d.downloadCount}
                  </span>
                </div>
                <Button as="a" href={d.fileUrl} variant="primary" size="md" className="w-full" icon={<Icon name="download" />}>
                  Download
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
