import Reveal from '../ui/Reveal.jsx';
import CaseStudyCard from './CaseStudyCard.jsx';

export default function CaseStudiesGrid({ studies }) {
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {studies.map((s, i) => (
            <Reveal key={s.slug} from="zoom" delay={i * 80}>
              <CaseStudyCard study={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
