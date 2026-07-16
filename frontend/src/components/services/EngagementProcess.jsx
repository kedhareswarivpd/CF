import { engagementProcess } from '../../data/services.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function EngagementProcess() {
  return (
    <section className="bg-brand-dark py-section-padding px-margin-mobile md:px-margin-desktop text-white relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="max-w-container mx-auto relative z-10">
        <Reveal className="text-center mb-16">
          <h2 className="font-display text-headline-md text-accent-cyan mb-4">Our Engineering Lifecycle</h2>
          <p className="font-body text-white max-w-2xl mx-auto">
            A rigorous, transparent framework designed for predictability and excellence at every stage.
          </p>
        </Reveal>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] process-line -translate-y-1/2 z-0 opacity-20" />
          <div className="grid md:grid-cols-5 gap-stack-lg relative z-10">
            {engagementProcess.map((step, i) => (
              <Reveal key={step.step} from="up" delay={i * 100}>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full border-2 border-accent-cyan flex items-center justify-center mb-stack-md group-hover:scale-110 transition-transform bg-brand-dark">
                    <Icon name={step.icon} className="text-accent-cyan" />
                  </div>
                  <h4 className="font-display text-body-lg font-semibold mb-2 text-white">
                    {step.step} {step.title}
                  </h4>
                  <p className="text-body-sm text-white">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
