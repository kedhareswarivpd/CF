import { Link } from 'react-router-dom';
import { featuredCaseStudy } from '../../data/projects.js';
import Icon from '../ui/Icon.jsx';

export default function FeaturedCaseStudy() {
  const cs = featuredCaseStudy;
  return (
    <section className="bg-surface px-margin-mobile py-stack-xl dark:bg-dark-surface md:px-margin-desktop">
      <div className="mx-auto max-w-container">
        <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card dark:border-dark-outline-variant dark:bg-dark-surface lg:flex-row">
          <div className="group relative h-80 overflow-hidden lg:h-auto lg:w-3/5">
            <div className="absolute inset-0 z-10 bg-brand/40 transition-all group-hover:bg-brand/20" />
            <img className="size-full object-cover" alt="High-tech data command center" src={cs.image} />
            <div className="absolute bottom-8 left-8 z-20 flex gap-4">
              <span className="rounded bg-accent-cyan px-4 py-1 text-body-sm font-bold text-brand-dark">
                {cs.tagPrimary}
              </span>
              <span className="rounded bg-white/90 px-4 py-1 text-body-sm text-brand backdrop-blur">
                {cs.tagSecondary}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-stack-md p-12 lg:w-2/5">
            <h2 className="font-display text-headline-md text-brand">{cs.title}</h2>
            <p className="font-body text-body-md text-ink-muted">{cs.description}</p>
            <div className="my-4 grid grid-cols-2 gap-4">
              {cs.stats.map((stat) => (
                <div key={stat.label}>
                  <span className="mb-1 block font-label-caps text-label-caps uppercase text-outline">
                    {stat.label}
                  </span>
                  <span className="text-xl font-bold text-brand">{stat.value}</span>
                </div>
              ))}
            </div>
            <Link
              to={`/portfolio/success/${cs.slug}`}
              className="group flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark"
            >
              Read Full Success Story
              <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
