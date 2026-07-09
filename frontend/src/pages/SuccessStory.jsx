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
    <main className="bg-surface dark:bg-dark-surface min-h-screen">
      {/* Hero */}
      <div className="relative h-80 md:h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-brand/60 z-10" />
        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 z-20 flex flex-col justify-end px-margin-mobile md:px-margin-desktop pb-10 max-w-container mx-auto">
          <div className="flex gap-3 mb-4">
            <span className="bg-accent-cyan text-brand-dark font-bold px-4 py-1 rounded text-body-sm">
              {story.tagPrimary}
            </span>
            <span className="bg-white/90 backdrop-blur text-brand px-4 py-1 rounded text-body-sm">
              {story.tagSecondary}
            </span>
          </div>
          <h1 className="font-display text-headline-lg text-white max-w-3xl">{story.title}</h1>
          <div className="flex flex-wrap gap-6 mt-4 text-white/80 text-body-sm">
            <span><strong className="text-white">Client:</strong> {story.client}</span>
            <span><strong className="text-white">Industry:</strong> {story.industry}</span>
            <span><strong className="text-white">Duration:</strong> {story.duration}</span>
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl flex flex-col gap-stack-xl">

        {/* Overview */}
        <p className="font-body text-body-lg text-ink-muted max-w-3xl">{story.overview}</p>

        {/* Challenge & Solution */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-outline-variant dark:border-dark-outline-variant p-8">
            <h2 className="font-display text-headline-sm text-brand mb-4">The Challenge</h2>
            <p className="font-body text-body-md text-ink-muted">{story.challenge}</p>
          </div>
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-outline-variant dark:border-dark-outline-variant p-8">
            <h2 className="font-display text-headline-sm text-brand mb-4">Our Solution</h2>
            <p className="font-body text-body-md text-ink-muted">{story.solution}</p>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="font-display text-headline-sm text-brand mb-6">Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {story.results.map((r) => (
              <div key={r.label} className="bg-white dark:bg-dark-surface rounded-lg border border-outline-variant dark:border-dark-outline-variant p-6 text-center">
                <span className="font-label-caps text-label-caps uppercase text-outline block mb-2">{r.label}</span>
                <span className="text-2xl font-bold text-brand">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="font-display text-headline-sm text-brand mb-4">Technology Stack</h2>
          <div className="flex flex-wrap gap-3">
            {story.techStack.map((tech) => (
              <span key={tech} className="bg-accent-cyan-pale text-brand font-label-caps px-4 py-2 rounded-full text-body-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        {story.testimonial && (
          <blockquote className="bg-brand rounded-lg p-10 text-white">
            <p className="font-body text-body-lg italic mb-6">"{story.testimonial.quote}"</p>
            <footer>
              <strong className="block">{story.testimonial.author}</strong>
              <span className="text-white/70 text-body-sm">{story.testimonial.company}</span>
            </footer>
          </blockquote>
        )}

        {/* Back */}
        <Link
          to="/portfolio"
          className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand hover:text-brand-dark transition-all w-fit"
        >
          <Icon name="arrow_back" />
          Back to Portfolio
        </Link>
      </div>
    </main>
  );
}
