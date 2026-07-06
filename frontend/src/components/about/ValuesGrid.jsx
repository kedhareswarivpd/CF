import { coreValues } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function ValuesGrid() {
  return (
    <section className="py-section-padding bg-surface-low dark:bg-dark-surface-low">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps uppercase text-brand tracking-widest">Principles</span>
          <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand mt-4">Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
          {coreValues.map((value) => {
            const isDark = value.variant === 'dark';
            return (
              <Reveal
                key={value.title}
                className={`${value.span} p-10 rounded-lg relative overflow-hidden group transition-all ${
                  isDark
                    ? 'bg-brand text-white hover:scale-[1.02]'
                    : 'bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant hover:shadow-card-hover'
                } ${value.title === 'Global Collaboration' ? 'flex flex-col justify-between' : ''}`}
              >
                <div className="relative z-10">
                  <Icon name={value.icon} className={`text-4xl mb-6 ${isDark ? 'text-accent-cyan' : 'text-brand'}`} />
                  <h3 className={`font-display text-headline-sm mb-4 ${isDark ? 'text-white' : 'text-brand-dark dark:text-dark-brand'}`}>
                    {value.title}
                  </h3>
                  <p className={`max-w-md ${isDark ? 'text-white/80' : 'text-ink-muted'}`}>{value.description}</p>
                </div>
                {value.decorativeIcon && (
                  <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon name={value.decorativeIcon} className="text-[160px] translate-y-12 translate-x-12" />
                  </div>
                )}
                {value.showAvatars && (
                  <div className="flex gap-4 mt-6 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-brand/10" />
                    <div className="w-8 h-8 rounded-full bg-brand/10" />
                    <div className="w-8 h-8 rounded-full bg-brand/10" />
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
