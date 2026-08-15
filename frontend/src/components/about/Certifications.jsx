import { certifications } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function Certifications() {
  return (
    <section className="mx-auto max-w-container px-margin-mobile py-section-padding text-center md:px-margin-desktop">
      <Reveal>
        <h2 className="mb-12 font-display text-headline-md text-brand-dark">Certified Excellence</h2>
      </Reveal>
      <div className="flex flex-wrap items-center justify-center gap-16">
        {certifications.map((cert, i) => (
          <Reveal key={cert.label} from="zoom" delay={i * 100}>
            <div className="flex flex-col items-center gap-4 opacity-80 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
              <div className="relative flex size-32 items-center justify-center rounded-full border-4 border-brand/20 p-4 transition-colors duration-300 hover:border-brand">
                <Icon name={cert.icon} className="text-5xl text-brand" />
                <div className="absolute -bottom-2 rounded bg-brand px-3 py-1 text-label-caps font-bold text-white">
                  {cert.tag}
                </div>
              </div>
              <p className="font-label-caps text-label-caps uppercase text-brand-dark">{cert.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
