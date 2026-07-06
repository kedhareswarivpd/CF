export default function ProjectCard({ project }) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg border border-outline-variant dark:border-dark-outline-variant hover-lift hover:shadow-card-hover flex flex-col overflow-hidden">
      <div className="h-56 relative overflow-hidden">
        <img className="w-full h-full object-cover" alt={`${project.title} mockup`} src={project.image} />
      </div>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <span className="font-label-caps text-label-caps uppercase text-brand bg-accent-cyan-pale px-3 py-1 rounded">
            {project.industry}
          </span>
          <span className="font-label-caps text-outline">{project.version}</span>
        </div>
        <h3 className="font-display text-lg text-brand">{project.title}</h3>
        <p className="font-body text-body-sm text-ink-muted">{project.description}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {project.tags.map((tag) => (
            <span key={tag} className="font-label-caps bg-surface-container dark:bg-dark-surface-container px-2 py-1 rounded text-ink-muted dark:text-dark-ink-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
