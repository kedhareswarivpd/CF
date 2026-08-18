import { useParams, Link } from 'react-router-dom';
import { services } from '../data/services.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import NotFound from './NotFound.jsx';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);

  useDocumentTitle(service ? `${service.title} | CoreFusion Technologies` : 'Not Found');

  if (!service) return <NotFound />;

  return (
    <main className="min-h-screen bg-surface dark:bg-dark-surface">
      <div className="mx-auto max-w-container px-margin-mobile py-section-padding md:px-margin-desktop">
        <div className="mb-12 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-xl bg-accent-cyan-pale">
            <Icon name={service.icon} className="text-5xl text-brand" />
          </div>
          <h1 className="font-display text-headline-lg text-brand-dark dark:text-dark-brand">{service.title}</h1>
        </div>

        <p className="mb-12 max-w-3xl font-body text-body-lg text-white">
          {service.description}
        </p>

        <div className="mb-12">
          <h2 className="mb-6 font-display text-headline-sm text-brand">Key Features</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {service.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface">
                <Icon name="check_circle" className="text-2xl text-brand" />
                <span className="font-body text-body-md text-ink dark:text-dark-ink">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 rounded-lg bg-brand p-8">
          <h2 className="mb-4 font-display text-headline-sm text-white">Business Benefit</h2>
          <p className="font-body text-body-lg text-white">{service.benefit}</p>
        </div>

        <Link
          to="/services"
          className="flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark"
        >
          <Icon name="arrow_back" />
          Back to Services
        </Link>
      </div>
    </main>
  );
}
