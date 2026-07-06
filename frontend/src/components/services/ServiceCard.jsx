import Icon from '../ui/Icon.jsx';

export default function ServiceCard({ service }) {
  return (
    <div className="bg-surface-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant p-stack-lg rounded-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-card-hover">
      <div className="w-12 h-12 rounded-lg bg-accent-cyan-pale flex items-center justify-center mb-stack-md">
        <Icon name={service.icon} className="text-brand text-4xl leading-none" />
      </div>
      <h3 className="font-display text-headline-sm text-ink dark:text-dark-ink mb-stack-sm">{service.title}</h3>
      <p className="font-body text-body-md text-ink-muted dark:text-dark-ink-muted mb-stack-md">{service.description}</p>
      <div className="mb-stack-md space-y-2">
        <p className="font-label-caps text-label-caps uppercase text-ink-muted/70">Key Features</p>
        <ul className="space-y-1">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-body-md">
              <Icon name="check_circle" className="text-brand text-body-lg leading-none" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto pt-stack-md border-t border-outline-variant">
        <p className="font-body font-semibold text-ink">Business Benefit</p>
        <p className="text-body-md text-ink-muted mb-stack-md">{service.benefit}</p>
        <a href="#" className="flex items-center w-fit text-brand font-label-caps text-label-caps uppercase hover:gap-2 gap-1 transition-all">
          Learn more <Icon name="arrow_forward" className="text-body-lg leading-none" />
        </a>
      </div>
    </div>
  );
}
