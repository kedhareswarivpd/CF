import Badge from '../ui/Badge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';

export default function CaseStudyCard({ study }) {
  return (
    <article className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
      <div className="p-stack-lg flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-accent-cyan-pale text-brand text-label-caps">{study.industry}</Badge>
        </div>
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-3">{study.title}</h3>
        <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{study.description}</p>
        <div className="mb-4">
          <h4 className="font-label-caps text-label-caps uppercase text-ink-muted mb-2">Key Results</h4>
          <ul className="space-y-1.5">
            {study.results.map((r) => (
              <li key={r} className="flex items-start gap-2 text-body-sm text-ink-muted">
                <Icon name="trending_up" className="text-status-success-text text-lg flex-shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant">
          {study.technologies.map((tech) => (
            <StatusBadge key={tech} variant="neutral">{tech}</StatusBadge>
          ))}
        </div>
      </div>
    </article>
  );
}
