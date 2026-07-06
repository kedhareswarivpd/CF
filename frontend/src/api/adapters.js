/**
 * Backend records use snake_case fields tailored to the CMS/admin schema.
 * These adapters translate them into the shape the (originally static-data-driven)
 * presentation components expect, so ServiceCard/ProjectCard don't need to know
 * or care whether their data came from the API or the local demo dataset.
 */

const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

export function adaptService(service) {
  return {
    icon: service.icon || 'domain',
    title: service.name,
    description: service.overview || '',
    features: (service.features || []).slice(0, 2),
    benefit: service.benefits?.[0] || service.solutions || '',
  };
}

export function adaptProject(project) {
  return {
    slug: project.slug,
    industry: project.industry || 'Enterprise',
    version: `v${Math.max(1, Math.round((project.progress_percent || 100) / 10) / 10).toFixed(1)}`,
    title: project.title,
    description: project.overview || project.challenge || '',
    tags: (project.technology_stack || []).slice(0, 3),
    image: project.cover_image || FALLBACK_PROJECT_IMAGE,
  };
}
