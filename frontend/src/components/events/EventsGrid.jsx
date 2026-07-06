import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function EventsGrid({ events, typeFilters }) {
  if (!events) return <LoadingSpinner />;
  if (!events.length) return <EmptyState icon="event" title="No events scheduled" description="Check back later." />;
  const [activeType, setActiveType] = useState('All');

  const filtered = activeType === 'All'
    ? events
    : events.filter((e) => e.type === activeType);

  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap gap-2 mb-stack-lg">
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-all ${
                activeType === t
                  ? 'bg-brand text-white'
                  : 'bg-surface-container dark:bg-dark-surface-container text-ink-muted dark:text-dark-ink-muted hover:bg-outline-variant dark:hover:bg-dark-outline-variant'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filtered.map((event) => (
            <Reveal key={event.slug}>
              <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg hover:shadow-card-hover transition-all hover:-translate-y-1 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge variant={event.isVirtual ? 'info' : 'success'}>
                    {event.isVirtual ? 'Virtual' : 'In-Person'}
                  </StatusBadge>
                  <Badge className="bg-accent-cyan-pale text-brand text-label-caps">{event.type}</Badge>
                </div>
                <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-3">{event.title}</h3>
                <p className="text-body-md text-ink-muted mb-4 flex-1">{event.description}</p>
                <div className="space-y-2 text-body-sm text-ink-muted pt-4 border-t border-outline-variant">
                  <div className="flex items-center gap-2">
                    <Icon name="calendar_today" className="text-brand text-lg" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="schedule" className="text-brand text-lg" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="location_on" className="text-brand text-lg" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <Button as="a" href={event.registrationUrl} variant="outline" size="md" className="w-full">
                    Register Now
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
