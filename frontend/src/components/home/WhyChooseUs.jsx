import { whyChooseUs } from '../../data/home.js';
import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function WhyChooseUs() {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto bg-white dark:bg-dark-surface">
      <SectionHeading
        align="center"
        eyebrow="Why CoreFusion"
        title="Engineering excellence, proven at scale"
        description="Five years of high-performance delivery for enterprises that can't afford downtime."
        className="mx-auto mb-stack-xl"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {whyChooseUs.map((item, i) => (
          <Reveal key={item.title} from="zoom" delay={i * 80} className="bg-white rounded-lg p-stack-lg hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 rounded-md bg-accent-cyan-pale flex items-center justify-center mb-stack-md">
              <Icon name={item.icon} className="text-brand text-3xl leading-none" />
            </div>
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-2">{item.title}</h3>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{item.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
