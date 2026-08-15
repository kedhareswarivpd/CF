import { useParams, Link } from 'react-router-dom';
import { successStories } from '../data/projects.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import NotFound from './NotFound.jsx';

export default function SuccessStory() {
  const { slug } = useParams();
  const story = successStories[slug];

  useDocumentTitle(story ? `${story.title} | CoreFusion Technologies` : 'Not Found');

  if (!story) return <NotFound />;

  return (
    <main className="min-h-screen bg-surface dark:bg-dark-surface">
      {/* Hero */}
      <div className="relative h-80 overflow-hidden md:h-[420px]">
        <div className="absolute inset-0 z-10 bg-brand/60" />
        <img src={story.image} alt={story.title} className="size-full object-cover" />
        <div className="absolute inset-0 z-20 mx-auto flex max-w-container flex-col justify-end px-margin-mobile pb-10 md:px-margin-desktop">
          <div className="mb-4 flex gap-3">
            <span className="rounded bg-accent-cyan px-4 py-1 text-body-sm font-bold text-brand-dark">
              {story.tagPrimary}
            </span>
            <span className="rounded bg-white/90 px-4 py-1 text-body-sm text-brand backdrop-blur">
              {story.tagSecondary}
            </span>
          </div>
          <h1 className="max-w-3xl font-display text-headline-lg text-white">{story.title}</h1>
          <div className="mt-4 flex flex-wrap gap-6 text-body-sm text-white/80">
            <span><strong className="text-white">Client:</strong> {story.client}</span>
            <span><strong className="text-white">Industry:</strong> {story.industry}</span>
            <span><strong className="text-white">Duration:</strong> {story.duration}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-container flex-col gap-stack-xl px-margin-mobile py-stack-xl md:px-margin-desktop">

        {/* Overview */}
        <p className="max-w-3xl font-body text-body-lg text-ink-muted">{story.overview}</p>

        {/* Challenge & Solution */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-outline-variant bg-white p-8 dark:border-dark-outline-variant dark:bg-dark-surface">
            <h2 className="mb-4 font-display text-headline-sm text-brand">The Challenge</h2>
            <p className="font-body text-body-md text-ink-muted">{story.challenge}</p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-white p-8 dark:border-dark-outline-variant dark:bg-dark-surface">
            <h2 className="mb-4 font-display text-headline-sm text-brand">Our Solution</h2>
            <p className="font-body text-body-md text-ink-muted">{story.solution}</p>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="mb-6 font-display text-headline-sm text-brand">Results</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {story.results.map((r) => (
              <div key={r.label} className="rounded-lg border border-outline-variant bg-white p-6 text-center dark:border-dark-outline-variant dark:bg-dark-surface">
                <span className="mb-2 block font-label-caps text-label-caps uppercase text-outline">{r.label}</span>
                <span className="text-2xl font-bold text-brand">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="mb-4 font-display text-headline-sm text-brand">Technology Stack</h2>
          <div className="flex flex-wrap gap-3">
            {story.techStack.map((tech) => (
              <span key={tech} className="rounded-full bg-accent-cyan-pale px-4 py-2 font-label-caps text-body-sm text-brand">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        {story.testimonial && (
          <blockquote className="rounded-lg bg-brand p-10 text-white">
            <p className="mb-6 font-body text-body-lg italic">&ldquo;{story.testimonial.quote}&rdquo;</p>
            <footer>
              <strong className="block">{story.testimonial.author}</strong>
              <span className="text-body-sm text-white/70">{story.testimonial.company}</span>
            </footer>
          </blockquote>
        )}

        {/* Back */}
        <Link
          to="/portfolio"
          className="flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark"
        >
          <Icon name="arrow_back" />
          Back to Portfolio
        </Link>
      </div>
    </main>
  );
}
