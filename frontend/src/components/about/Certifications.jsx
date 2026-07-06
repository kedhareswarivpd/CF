import { certifications } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function Certifications() {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto text-center">
      <Reveal>
        <h2 className="font-display text-headline-md text-brand-dark mb-12">Certified Excellence</h2>
      </Reveal>
      <div className="flex flex-wrap justify-center items-center gap-16">
        {certifications.map((cert, i) => (
          <Reveal key={cert.label} from="zoom" delay={i * 100}>
            <div className="flex flex-col items-center gap-4 opacity-80 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="w-32 h-32 rounded-full border-4 border-brand/20 flex items-center justify-center p-4 relative hover:border-brand transition-colors duration-300">
                <Icon name={cert.icon} className="text-5xl text-brand" />
                <div className="absolute -bottom-2 bg-brand text-white px-3 py-1 rounded text-label-caps font-bold">
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
