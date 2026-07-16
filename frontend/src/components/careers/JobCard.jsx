import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';

export default function JobCard({ job }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{job.title}</h3>
        <Badge className="bg-accent-cyan-pale text-brand text-label-caps whitespace-nowrap">{job.department}</Badge>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 text-body-sm text-white">
        <span className="flex items-center gap-1.5">
          <Icon name="location_on" className="text-body-md leading-none" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="work_history" className="text-body-md leading-none" />
          {job.type}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="school" className="text-body-md leading-none" />
          {job.experience}
        </span>
      </div>
      <p className="text-body-md text-white mb-4">{job.description}</p>
      <details className="group" aria-label={job.title}>
        <summary className="cursor-pointer font-label-caps text-label-caps uppercase text-brand hover:text-brand-dark transition-colors list-none flex items-center gap-2">
          <span>View Details</span>
          <Icon name="expand_more" className="text-lg transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-label-caps text-label-caps uppercase text-ink-muted mb-2">Responsibilities</h4>
            <ul className="space-y-1.5">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2 text-body-sm text-ink-muted">
                  <Icon name="check_circle" className="text-brand text-lg flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label-caps text-label-caps uppercase text-ink-muted mb-2">Requirements</h4>
            <ul className="space-y-1.5">
              {job.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2 text-body-sm text-ink-muted">
                  <Icon name="chevron_right" className="text-brand text-lg flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}
