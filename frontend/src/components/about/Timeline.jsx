import { timeline } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

function TimelineCard({ entry }) {
  const isPresent = entry.side === 'present';
  return (
    <div
      className={`p-8 rounded-lg shadow-sm hover:shadow-md transition-all ${
        isPresent ? 'bg-brand shadow-lg' : 'bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant'
      }`}
    >
      <span className={`font-stat text-stat-lg block mb-2 ${isPresent ? 'text-white' : 'text-brand'}`}>
        {entry.year}
      </span>
      <h4 className={`font-display text-headline-sm mb-2 ${isPresent ? 'text-white' : 'text-brand-dark dark:text-dark-brand'}`}>
        {entry.title}
      </h4>
      <p className={isPresent ? 'text-white/80' : 'text-ink-muted'}>{entry.description}</p>
    </div>
  );
}

export default function Timeline() {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto overflow-hidden">
      <div className="text-center mb-20">
        <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">Our Journey</h2>
        <div className="h-1 w-20 bg-brand mx-auto mt-4 rounded-full" />
      </div>
      <div className="relative space-y-24 timeline-line">
        {timeline.map((entry) => (
          <Reveal
            key={entry.year}
            className="relative z-10 flex flex-col md:flex-row items-center justify-between"
          >
            {entry.side === 'left' && (
              <>
                <div className="md:w-5/12 text-right order-2 md:order-1">
                  <TimelineCard entry={entry} />
                </div>
                <TimelineDot />
                <div className="md:w-5/12 order-3" />
              </>
            )}
            {entry.side === 'right' && (
              <>
                <div className="md:w-5/12 order-1" />
                <TimelineDot />
                <div className="md:w-5/12 order-2 md:order-3">
                  <TimelineCard entry={entry} />
                </div>
              </>
            )}
            {entry.side === 'present' && (
              <>
                <div className="md:w-5/12 order-1" />
                <TimelineDot icon={entry.icon} glow />
                <div className="md:w-5/12 order-2 md:order-3">
                  <TimelineCard entry={entry} />
                </div>
              </>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TimelineDot({ icon, glow = false }) {
  return (
    <div
      className={`w-12 h-12 bg-brand border-4 border-white rounded-full order-1 md:order-2 my-4 md:my-0 flex items-center justify-center flex-shrink-0 ${
        glow ? 'shadow-[0_0_20px_rgba(61,98,104,0.4)]' : ''
      }`}
    >
      {icon ? <Icon name={icon} className="text-white text-sm" /> : <span className="w-2 h-2 bg-white rounded-full" />}
    </div>
  );
}
