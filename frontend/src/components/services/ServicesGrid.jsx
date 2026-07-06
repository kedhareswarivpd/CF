import { services as fallbackServices } from '../../data/services.js';
import { fetchServices } from '../../api/services.js';
import { adaptService } from '../../api/adapters.js';
import useApiResource from '../../hooks/useApiResource.js';
import ServiceCard from './ServiceCard.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function ServicesGrid() {
  const { items: services, loading } = useApiResource(fetchServices, adaptService, fallbackServices);

  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      <div className="flex flex-col items-center mb-stack-xl text-center gap-4">
        <h2 className="font-display text-headline-md text-ink">Full-Stack Digital Transformation</h2>
        <div className="h-1 w-20 bg-brand rounded-full" />
      </div>
      {loading ? (
        <ServicesGridSkeleton />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {services.map((service, i) => (
            <Reveal key={service.title} style={{ transitionDelay: `${i * 100}ms` }}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function ServicesGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gutter animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-80 rounded-lg bg-surface-container" />
      ))}
    </div>
  );
}
