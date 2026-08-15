import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';


export default function Hero() {
  return (
    <section className="relative flex min-h-[720px] items-center overflow-hidden bg-brand-dark px-margin-mobile py-section-padding md:px-margin-desktop">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
        src='/hero-video.mp4'
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-surface/75 to-brand-dark/40" />
      {/* Decorative floating orbs */}
      <div className="animate-float-slow pointer-events-none absolute right-1/4 top-20 size-64 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="animate-float pointer-events-none absolute bottom-10 left-1/3 size-48 rounded-full bg-brand/10 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-container">
        <div className="flex w-full flex-col gap-stack-lg">
          <Badge className="animate-hero-1 w-fit border border-white/20 bg-white/10 text-accent-cyan">
            Engineering Tomorrow
          </Badge>
          <h1 className="animate-hero-2 max-w-4xl font-display text-display-lg-mobile leading-tight text-white md:text-display-lg">
            Transforming Businesses Through <span className="text-accent-cyan">Intelligent</span> Digital
            Solutions
          </h1>
          <p className="animate-hero-3 max-w-xl font-body text-body-lg text-white">
            Empowering global enterprises with high-performance architectures, AI-driven automation, and
            secure-by-design digital infrastructure.
          </p>
          <div className="animate-hero-4 flex flex-wrap gap-4 pt-4">
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
