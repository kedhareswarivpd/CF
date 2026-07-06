import { globalOffices } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';

export default function GlobalPresence() {
  return (
    <section className="py-section-padding bg-brand text-white relative overflow-hidden">
      <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-accent-cyan">Our Network</span>
            <h2 className="font-display text-headline-md mt-4 mb-8">Global Engineering Hubs</h2>
            <div className="grid grid-cols-2 gap-y-12 gap-x-8">
              {globalOffices.map((office) => (
                <div key={office.city} className="flex items-start gap-4">
                  <Icon name="location_on" className="text-accent-cyan" />
                  <div>
                    <h4 className="font-display text-headline-sm text-base mb-1">{office.city}</h4>
                    <p className="text-xs text-white/60 uppercase tracking-tighter">{office.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
            <div className="text-center p-8">
              <Icon name="language" className="text-6xl text-accent-cyan mb-4 animate-pulse" />
              <p className="font-label-caps text-label-caps uppercase">Integrated Global Infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
