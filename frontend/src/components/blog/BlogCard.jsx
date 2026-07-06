import Badge from '../ui/Badge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';

export default function BlogCard({ post }) {
  return (
    <article className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
      <div className="p-stack-lg flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-accent-cyan-pale text-brand text-label-caps">{post.category}</Badge>
        </div>
        <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-3">{post.title}</h3>
        <p className="text-body-md text-ink-muted dark:text-dark-ink-muted mb-4 flex-1">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-body-sm text-ink-muted dark:text-dark-ink-muted pt-4 border-t border-outline-variant dark:border-dark-outline-variant">
          <div>
            <p className="font-semibold text-ink dark:text-dark-ink">{post.author}</p>
            <p className="text-label-caps text-label-caps">{post.role}</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-label-caps text-label-caps uppercase">
            <span className="flex items-center gap-1">
              <Icon name="calendar_today" className="text-body-md leading-none" />
              {post.publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="schedule" className="text-body-md leading-none" />
              {post.readTime}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((t) => (
            <StatusBadge key={t} variant="neutral">{t}</StatusBadge>
          ))}
        </div>
      </div>
    </article>
  );
}
