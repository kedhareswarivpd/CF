import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';


export default function Hero() {
return (
    <section className="relative min-h-[720px] flex items-center overflow-hidden py-section-padding px-margin-mobile md:px-margin-desktop bg-brand-dark">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        src='/hero-video.mp4'
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(10,37,64,0.92) 0%, rgba(15,52,96,0.75) 60%, rgba(10,37,64,0.4) 100%)' }}
      />
      {/* Decorative floating orbs */}
      <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full blur-3xl animate-float-slow pointer-events-none" style={{ background: 'rgba(0,212,255,0.08)' }} />
      <div className="absolute bottom-10 left-1/3 w-48 h-48 rounded-full blur-2xl animate-float pointer-events-none" style={{ background: 'rgba(37,99,235,0.10)' }} />

      <div className="max-w-container mx-auto relative z-10">
        <div className="flex flex-col gap-stack-lg max-w-2xl">
          <Badge className="bg-white/10 border border-white/20 text-accent-cyan w-fit animate-hero-1">
            Engineering Tomorrow
          </Badge>
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-white leading-tight animate-hero-2">
            Transforming Businesses Through <span className="text-accent-cyan">Intelligent</span> Digital
            Solutions
          </h1>
          <p className="font-body text-body-lg text-white max-w-xl animate-hero-3">
            Empowering global enterprises with high-performance architectures, AI-driven automation, and
            secure-by-design digital infrastructure.
          </p>
          <div className="flex flex-wrap gap-4 pt-4 animate-hero-4">
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
