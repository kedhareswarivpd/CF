import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

const SOLUTIONS = [
  { label: 'Solutions', to: '/solutions' },
  { label: 'Products', to: '/products' },
  { label: 'Technologies', to: '/technologies' },
  { label: 'Industries', to: '/industries' },
];
const RESOURCES = [
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Resources', to: '/resources' },
  { label: 'Blog', to: '/blog' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Downloads', to: '/downloads' },
  { label: 'FAQ', to: '/faq' },
];
const COMPANY = [
  { label: 'About Us', to: '/about' },
  { label: 'Awards', to: '/awards' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
];
const HQ = 'Connaught Place, New Delhi, India';
const OFFICES = ['Bangalore', 'Dubai', 'Singapore', 'Mumbai'];

export default function Footer() {
  return (
    <footer className="w-full pt-section-padding pb-stack-lg px-margin-mobile md:px-margin-desktop bg-brand-dark text-ink-inverse">
      <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">

        {/* Brand — spans 2 cols */}
        <div className="col-span-2">
          <span className="font-display text-headline-sm text-white block mb-6">CoreFusion</span>
          <p className="text-surface-dim font-body text-body-sm max-w-xs mb-8 leading-relaxed">
            Engineering excellence for a digital world. We provide high-performance solutions for
            complex enterprise challenges.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <Icon name="alternate_email" className="text-sm" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <Icon name="share" className="text-sm" />
            </a>
          </div>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Solutions</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {SOLUTIONS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Resources</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {RESOURCES.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Company</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {COMPANY.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Headquarters + Global Offices */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-4">Headquarters</h4>
          <p className="flex items-start gap-2 font-body text-body-sm text-surface-dim mb-8">
            <Icon name="location_on" className="text-accent-cyan text-base mt-0.5 shrink-0" />
            {HQ}
          </p>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-4">Global Offices</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {OFFICES.map((office) => (
              <li key={office} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                {office}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="max-w-container mx-auto pt-10 mt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Icon name="public" className="text-accent-cyan text-xl" />
          <p className="font-body text-body-sm text-surface-dim">
            &copy; 2026 CoreFusion Technologies. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8 font-label-caps text-label-caps uppercase tracking-widest text-white">
          <Link to="/privacy" className="hover:text-accent-cyan transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-accent-cyan transition-colors">Terms of Service</Link>
          <Link to="/cookies" className="hover:text-accent-cyan transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
