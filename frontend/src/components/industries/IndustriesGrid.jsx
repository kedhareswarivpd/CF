import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function IndustriesGrid({ industries }) {
  return (
    <section className="py-section-padding">
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.title} from="zoom" delay={i * 80}>
              <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-accent-cyan-pale">
                  <Icon name={ind.icon} className="text-2xl text-brand" />
                </div>
                <h3 className="mb-3 font-display text-headline-sm text-black dark:text-white">{ind.title}</h3>
                <p className="mb-4 flex-1 text-body-md text-black dark:text-white">{ind.description}</p>
                <div className="mb-4">
                  <h4 className="mb-2 font-label-caps text-label-caps uppercase text-black dark:text-white">Key Challenges</h4>
                  <ul className="space-y-1.5">
                    {ind.challenges.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-body-sm text-black dark:text-white">
                        <Icon name="chevron_right" className="flex-shrink-0 text-lg text-brand" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-outline-variant pt-4">
                  <p className="text-body-sm font-semibold italic text-brand">{ind.stats}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
