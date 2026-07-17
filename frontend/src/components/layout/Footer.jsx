import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import FooterMap from './FooterMap.jsx';

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
  const { pathname } = useLocation();
  const showMap = pathname === '/';

  return (
    <footer className="relative w-full pb-stack-lg px-margin-mobile md:px-margin-desktop bg-white text-ink overflow-hidden">
      {/* Real world map with HQ + office pins — landing page only */}
      {showMap && (
        <div className="max-w-container mx-auto mb-12 rounded-xl overflow-hidden border border-outline-variant shadow-card">
          <FooterMap />
        </div>
      )}
      <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">

        {/* Brand — spans 2 cols */}
        <div className="col-span-2">
          <span className="font-display text-headline-sm text-brand-dark block mb-6">CoreFusion</span>
          <p className="text-ink-muted font-body text-body-sm max-w-xs mb-8 leading-relaxed">
            Engineering excellence for a digital world. We provide high-performance solutions for
            complex enterprise challenges.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full border border-brand/20 flex items-center justify-center hover:bg-brand/10 transition-colors text-brand-dark"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="w-10 h-10 rounded-full border border-brand/20 flex items-center justify-center hover:bg-brand/10 transition-colors text-brand-dark"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-brand-dark mb-6">Solutions</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {SOLUTIONS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-brand-dark mb-6">Resources</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {RESOURCES.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-brand-dark mb-6">Company</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {COMPANY.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-accent-cyan transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Headquarters + Global Offices */}
        <div>
          <h4 className="font-label-caps text-label-caps uppercase text-brand-dark mb-6">Headquarters</h4>
          <p className="flex items-start gap-2 font-body text-body-sm text-ink-muted mb-8">
            <Icon name="location_on" className="text-brand text-base mt-0.5 shrink-0" />
            {HQ}
          </p>
          <h4 className="font-label-caps text-label-caps uppercase text-brand-dark mb-6">Global Offices</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {OFFICES.map((office) => (
              <li key={office} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                {office}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="max-w-container mx-auto pt-10 pb-4 mt-12 border-t border-ink/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Icon name="public" className="text-brand text-xl" />
          <p className="font-body text-body-sm text-ink-muted">
            &copy; 2026 CoreFusion Technologies. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8 font-label-caps text-label-caps uppercase tracking-widest text-ink-muted">
          <Link to="/privacy" className="hover:text-accent-cyan transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-accent-cyan transition-colors">Terms of Service</Link>
          <Link to="/cookies" className="hover:text-accent-cyan transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
