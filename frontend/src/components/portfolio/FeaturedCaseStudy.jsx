import { featuredCaseStudy } from '../../data/projects.js';
import Icon from '../ui/Icon.jsx';

export default function FeaturedCaseStudy() {
  const cs = featuredCaseStudy;
  return (
    <section className="py-stack-xl px-margin-mobile md:px-margin-desktop bg-surface dark:bg-dark-surface">
      <div className="max-w-container mx-auto">
        <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-card flex flex-col lg:flex-row border border-outline-variant dark:border-dark-outline-variant">
          <div className="lg:w-3/5 h-80 lg:h-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand/40 group-hover:bg-brand/20 transition-all z-10" />
            <img className="w-full h-full object-cover" alt="High-tech data command center" src={cs.image} />
            <div className="absolute bottom-8 left-8 z-20 flex gap-4">
              <span className="bg-accent-cyan text-brand-dark font-bold px-4 py-1 rounded text-body-sm">
                {cs.tagPrimary}
              </span>
              <span className="bg-white/90 backdrop-blur text-brand px-4 py-1 rounded text-body-sm">
                {cs.tagSecondary}
              </span>
            </div>
          </div>
          <div className="lg:w-2/5 p-12 flex flex-col justify-center gap-stack-md">
            <h2 className="font-display text-headline-md text-brand">{cs.title}</h2>
            <p className="font-body text-body-md text-ink-muted">{cs.description}</p>
            <div className="grid grid-cols-2 gap-4 my-4">
              {cs.stats.map((stat) => (
                <div key={stat.label}>
                  <span className="font-label-caps text-label-caps uppercase text-outline block mb-1">
                    {stat.label}
                  </span>
                  <span className="text-xl font-bold text-brand">{stat.value}</span>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand hover:text-brand-dark transition-all group w-fit">
              Read Full Success Story
              <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
