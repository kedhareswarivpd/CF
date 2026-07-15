import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function CultureSection({ values, benefits }) {
  return (
    <>
      <section className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
          <SectionHeading
            eyebrow="Our Culture"
            title="Life at CoreFusion"
            description="We believe great technology comes from great teams. Here is what makes working with us unique."
            align="center"
            className="mb-stack-lg"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {values.map((v, i) => (
              <Reveal key={v.title} from="zoom" delay={i * 80} className="h-full">
                <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg text-center flex flex-col items-center h-full">
                  <div className="w-12 h-12 rounded-full bg-accent-cyan-pale flex items-center justify-center mx-auto mb-4">
                    <Icon name={v.icon} className="text-brand text-2xl" />
                  </div>
                  <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-2 min-h-16 flex items-center">{v.title}</h3>
                  <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section-padding">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
          <SectionHeading
            eyebrow="Benefits"
            title="We Invest in Our People"
            description="Comprehensive benefits designed to support your growth, well-being, and future."
            align="center"
            className="mb-stack-lg"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {benefits.map((b, i) => (
              <Reveal key={b.title} from="left" delay={i * 80}>
                <div className="flex items-start gap-4 bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
                  <div className="w-10 h-10 rounded-lg bg-accent-cyan-pale flex items-center justify-center flex-shrink-0">
                    <Icon name={b.icon} className="text-brand text-xl" />
                  </div>
                  <div>
                    <h3 className="font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand mb-1">{b.title}</h3>
                    <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{b.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
