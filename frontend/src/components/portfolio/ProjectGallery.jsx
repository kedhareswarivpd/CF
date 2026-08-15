import { useCallback, useState, useEffect } from 'react';
import { projects as fallbackProjects } from '../../data/projects.js';
import { fetchProjects } from '../../api/projects.js';
import { adaptProject } from '../../api/adapters.js';
import useApiResource from '../../hooks/useApiResource.js';
import ProjectCard from './ProjectCard.jsx';
import Reveal from '../ui/Reveal.jsx';

const PAGE_SIZE = 6;

export default function ProjectGallery({ industry }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const fetchFn = useCallback(() => fetchProjects({ industry }), [industry]);

  const fallback =
    industry && industry !== 'All'
      ? fallbackProjects.filter((p) => p.industry === industry)
      : fallbackProjects;

  const { items: projects, loading, isFallback } = useApiResource(fetchFn, adaptProject, fallback, [industry]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [industry]);

  const visibleProjects = projects.slice(0, visible);
  const remaining = projects.length - visible;

  return (
    <section className="px-margin-mobile pb-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container">
        {isFallback && !loading && (
          <p className="mb-6 text-center text-body-sm text-ink-muted">
            Showing sample projects — connect a live backend to see real portfolio data here.
          </p>
        )}
        {loading ? (
          <GallerySkeleton />
        ) : projects.length === 0 ? (
          <p className="py-16 text-center text-ink-muted">No projects match this filter yet — check back soon.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project, i) => (
              <Reveal key={project.slug || project.title} from="zoom" delay={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
        {remaining > 0 && (
          <div className="mt-12 text-center">
            <Reveal from="up">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-full border-2 border-brand px-8 py-3 font-label-caps text-label-caps uppercase text-brand transition-all hover:bg-brand hover:text-white active:scale-95"
              >
                View More Projects ({remaining} Remaining)
              </button>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-96 rounded-lg bg-surface-container" />
      ))}
    </div>
  );
}
