import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

export default function CtaBanner() {
  return (
    <section className="bg-brand-dark text-white py-section-padding px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container mx-auto flex flex-col md:flex-row items-center justify-between gap-stack-lg">
        <div>
          <h2 className="font-display text-headline-md mb-2">Ready to engineer what's next?</h2>
          <p className="text-surface-dim max-w-xl">
            Talk to a Solution Architect about your next digital transformation initiative.
          </p>
        </div>
        <Button as={Link} to="/about" variant="inverse" icon={<Icon name="arrow_forward" />}>
          Get in Touch
        </Button>
      </div>
    </section>
  );
}
