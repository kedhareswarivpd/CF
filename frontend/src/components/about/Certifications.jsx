import { certifications } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';

export default function Certifications() {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto text-center">
      <h2 className="font-display text-headline-md text-brand-dark mb-12">Certified Excellence</h2>
      <div className="flex flex-wrap justify-center items-center gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
        {certifications.map((cert) => (
          <div key={cert.label} className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-brand/20 flex items-center justify-center p-4 relative">
              <Icon name={cert.icon} className="text-5xl text-brand" />
              <div className="absolute -bottom-2 bg-brand text-white px-3 py-1 rounded text-label-caps font-bold">
                {cert.tag}
              </div>
            </div>
            <p className="font-label-caps text-label-caps uppercase text-brand-dark">{cert.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
