import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function CtaBanner() {
  return (
    <section className="bg-white px-margin-mobile py-section-padding text-brand-dark dark:bg-dark-surface md:px-margin-desktop">
      <Reveal className="mx-auto flex max-w-container flex-col items-center justify-center gap-stack-lg md:flex-row">
        <div>
          <h2 className="mb-2 font-display text-headline-md text-brand-dark dark:text-white">Ready to engineer what&apos;s next?</h2>
          <p className="max-w-xl text-ink-muted dark:text-white/70">
            Talk to a Solution Architect about your next digital transformation initiative.
          </p>
        </div>
        <Button as={Link} to="/contact" variant="inverse" icon={<Icon name="arrow_forward" />}>
          Get in Touch
        </Button>
      </Reveal>
    </section>
  );
}
