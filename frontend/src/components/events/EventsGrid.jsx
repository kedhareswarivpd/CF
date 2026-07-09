import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';
import { submitContactForm } from '../../api/contact.js';

function RegisterModal({ event, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitContactForm({
        ...form,
        subject: `Event Registration: ${event.title}`,
        message: `I would like to register for the event: ${event.title} on ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${event.location}.`,
        department: 'events',
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Register for Event</h2>
            <p className="text-body-sm text-ink-muted mt-1">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink ml-4">
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <Icon name="check_circle" className="text-5xl text-green-500 mb-3" />
            <p className="font-semibold text-ink-dark dark:text-dark-ink">Registration received!</p>
            <p className="text-body-sm text-ink-muted mt-1">We'll send confirmation details to {form.email}.</p>
            <Button variant="outline" size="md" className="mt-6" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-caps font-label-caps text-ink-muted mb-1">Full Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-white dark:bg-dark-surface-container dark:border-dark-outline-variant focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-label-caps font-label-caps text-ink-muted mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-white dark:bg-dark-surface-container dark:border-dark-outline-variant focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-caps font-label-caps text-ink-muted mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-white dark:bg-dark-surface-container dark:border-dark-outline-variant focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-ink-muted mb-1">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-white dark:bg-dark-surface-container dark:border-dark-outline-variant focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            {status === 'error' && (
              <p className="text-body-sm text-red-500">Something went wrong. Please try again.</p>
            )}
            <Button type="submit" variant="primary" size="md" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting…' : 'Confirm Registration'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function EventsGrid({ events, typeFilters }) {
  if (!events) return <LoadingSpinner />;
  if (!events.length) return <EmptyState icon="event" title="No events scheduled" description="Check back later." />;

  const [activeType, setActiveType] = useState('All');
  const [registerEvent, setRegisterEvent] = useState(null);

  const filtered = activeType === 'All' ? events : events.filter((e) => e.type === activeType);

  function handleRegister(event) {
    const url = event.registrationUrl;
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setRegisterEvent(event);
    }
  }

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
          {filtered.map((event, i) => (
            <Reveal key={event.slug} from="zoom" delay={i * 80}>
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
                  <Button variant="outline" size="md" className="w-full" onClick={() => handleRegister(event)}>
                    Register Now
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {registerEvent && (
        <RegisterModal event={registerEvent} onClose={() => setRegisterEvent(null)} />
      )}
    </section>
  );
}
