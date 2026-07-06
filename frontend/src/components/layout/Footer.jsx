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
const OFFICES = ['Bangalore', 'Dubai', 'Singapore', 'Mumbai'];

export default function Footer() {
  return (
    <footer className="w-full pt-section-padding pb-stack-lg px-margin-mobile md:px-margin-desktop bg-brand-dark text-ink-inverse">
      <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
        <div className="col-span-2 lg:col-span-2">
          <span className="font-display text-headline-sm text-white block mb-6">CoreFusion</span>
          <p className="text-surface-dim font-body text-body-sm max-w-sm mb-8 leading-relaxed">
            Engineering excellence for a digital world. We provide high-performance solutions for
            complex enterprise challenges.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Icon name="alternate_email" className="text-sm" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Icon name="share" className="text-sm" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Solutions</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {SOLUTIONS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Resources</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {RESOURCES.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Company</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {COMPANY.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-white mb-6">Global Offices</h4>
          <ul className="space-y-3 font-body text-body-sm text-surface-dim">
            {OFFICES.map((office) => (
              <li key={office} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                {office}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-container mx-auto pt-12 mt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-body text-body-sm text-surface-dim">
          &copy; {new Date().getFullYear()} CoreFusion Technologies. All rights reserved. Engineering Excellence
          Global.
        </p>
        <div className="flex gap-8 font-label-caps text-label-caps uppercase tracking-widest text-surface-dim">
          <Link to="/privacy" className="hover:text-accent-cyan transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-accent-cyan transition-colors">
            Terms of Service
          </Link>
          <Link to="/cookies" className="hover:text-accent-cyan transition-colors">
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
