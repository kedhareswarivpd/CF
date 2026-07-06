import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function TechGrid({ categories }) {
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="space-y-stack-lg">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} from="left" delay={i * 80}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg overflow-hidden">
                <div className="bg-surface-container dark:bg-dark-surface-container px-stack-lg py-4 flex items-center gap-3 border-b border-outline-variant dark:border-dark-outline-variant">
                  <Icon name={cat.icon} className="text-brand text-xl" />
                  <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{cat.name}</h3>
                </div>
                <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
                  {cat.technologies.map((tech) => (
                    <div key={tech.name} className="px-stack-lg py-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand">{tech.name}</span>
                        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mt-0.5">{tech.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-24 h-2 bg-surface-container dark:bg-dark-surface-low rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full transition-all"
                            style={{ width: `${tech.proficiency}%` }}
                          />
                        </div>
                        <span className="font-label-caps text-label-caps text-ink-muted w-8 text-right">
                          {tech.proficiency}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
