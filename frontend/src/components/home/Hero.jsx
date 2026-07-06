import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export default function Hero() {
  return (
    <section
      className="relative min-h-[720px] flex items-center overflow-hidden py-section-padding px-margin-mobile md:px-margin-desktop"
      style={{
        background:
          'radial-gradient(circle at top right, rgba(167, 205, 213, 0.15), transparent 40%), radial-gradient(circle at bottom left, #3d6268, #191c1e)',
      }}
    >
      <div className="max-w-container mx-auto relative z-10">
        <div className="flex flex-col gap-stack-lg max-w-2xl">
          <Badge className="bg-white/10 border border-white/20 text-accent-cyan w-fit">
            Engineering Tomorrow
          </Badge>
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-white leading-tight">
            Transforming Businesses Through <span className="text-accent-cyan">Intelligent</span> Digital
            Solutions
          </h1>
          <p className="font-body text-body-lg text-surface-dim max-w-xl">
            Empowering global enterprises with high-performance architectures, AI-driven automation, and
            secure-by-design digital infrastructure.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button as={Link} to="/services" variant="primary" icon={<Icon name="arrow_forward" />}>
              Explore Solutions
            </Button>
            <Button as={Link} to="/portfolio" variant="outline-light">
              View Portfolio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
