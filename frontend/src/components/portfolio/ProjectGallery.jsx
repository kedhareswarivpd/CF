import { useCallback } from 'react';
import { projects as fallbackProjects } from '../../data/projects.js';
import { fetchProjects } from '../../api/projects.js';
import { adaptProject } from '../../api/adapters.js';
import useApiResource from '../../hooks/useApiResource.js';
import ProjectCard from './ProjectCard.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function ProjectGallery({ industry }) {
  const fetchFn = useCallback(() => fetchProjects({ industry }), [industry]);

  const fallback =
    industry && industry !== 'All'
      ? fallbackProjects.filter((p) => p.industry === industry)
      : fallbackProjects;

  const { items: projects, loading, isFallback } = useApiResource(fetchFn, adaptProject, fallback, [industry]);

  return (
    <section className="pb-stack-xl px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container mx-auto">
        {isFallback && !loading && (
          <p className="text-center text-body-sm text-ink-muted mb-6">
            Showing sample projects — connect a live backend to see real portfolio data here.
          </p>
        )}
        {loading ? (
          <GallerySkeleton />
        ) : projects.length === 0 ? (
          <p className="text-center text-ink-muted py-16">No projects match this filter yet — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <Reveal key={project.slug || project.title} from="zoom" delay={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Reveal from="up">
            <button className="border-2 border-brand text-brand px-8 py-3 rounded-full font-label-caps text-label-caps uppercase hover:bg-brand hover:text-white transition-all active:scale-95">
              View More Projects (427 Remaining)
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-96 rounded-lg bg-surface-container" />
      ))}
    </div>
  );
}
