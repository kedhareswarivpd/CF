import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

const STATUS_VARIANTS = {
  GA: 'success',
  Beta: 'warning',
  'Coming Soon': 'info',
};

export default function ProductsGrid({ products }) {
  if (!products) return <LoadingSpinner />;
  if (!products.length) return <EmptyState icon="inventory_2" title="No products available" description="Products will appear here." />;
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {products.map((p) => (
            <Reveal key={p.title}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent-cyan-pale flex items-center justify-center">
                    <Icon name={p.icon} className="text-brand text-2xl" />
                  </div>
                  <StatusBadge variant={STATUS_VARIANTS[p.status] || 'neutral'} className="font-semibold">{p.status}</StatusBadge>
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-1">{p.title}</h3>
                <p className="text-label-caps text-label-caps uppercase text-ink-muted mb-3">{p.tagline}</p>
                <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{p.description}</p>
                <ul className="space-y-2 pt-4 border-t border-outline-variant">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-body-sm text-ink-muted">
                      <Icon name="check_circle" className="text-brand text-lg flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
