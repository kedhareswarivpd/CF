import EventsHero from '../components/events/EventsHero.jsx';
import EventsGrid from '../components/events/EventsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { events, eventTypeFilters } from '../data/events.js';

export default function Events() {
  useDocumentTitle('Events | CoreFusion Technologies');
  return (
    <>
      <EventsHero />
      <SectionHeading
        eyebrow="Upcoming Events"
        title="Join Us Around the World"
        description="From intimate workshops to industry conferences, discover opportunities to connect with our team."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pt-section-padding"
      />
      <EventsGrid events={events} typeFilters={eventTypeFilters} />
      <CtaBanner />
    </>
  );
}
