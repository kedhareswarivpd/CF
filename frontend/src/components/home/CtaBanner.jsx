import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function CtaBanner() {
  return (
    <section className="bg-white text-brand-dark py-section-padding px-margin-mobile md:px-margin-desktop">
      <Reveal className="max-w-container mx-auto flex flex-col md:flex-row items-center justify-center gap-stack-lg">
        <div>
          <h2 className="font-display text-headline-md text-brand-dark mb-2">Ready to engineer what's next?</h2>
          <p className="text-ink-muted max-w-xl">
            Talk to a Solution Architect about your next digital transformation initiative.
          </p>
        </div>
        <Button as={Link} to="/about" variant="inverse" icon={<Icon name="arrow_forward" />}>
          Get in Touch
        </Button>
      </Reveal>
    </section>
  );
}
