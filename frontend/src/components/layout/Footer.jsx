import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import FooterMap from './FooterMap.jsx';
import { COMPANY as COMPANY_INFO } from '../../data/company.js';

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
const { hq: HQ, offices: OFFICES } = COMPANY_INFO;

export default function Footer() {
  const { pathname } = useLocation();
  const showMap = pathname === '/';

  return (
    <footer className="relative w-full overflow-hidden bg-white px-margin-mobile pb-stack-lg text-ink md:px-margin-desktop">
      {/* Real world map with HQ + office pins — landing page only */}
      {showMap && (
        <div className="mx-auto mb-12 max-w-container overflow-hidden rounded-xl border border-outline-variant shadow-card">
          <FooterMap />
        </div>
      )}
      <div className="mx-auto grid max-w-container grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-6">

        {/* Brand — spans 2 cols */}
        <div className="col-span-2">
          <span className="mb-6 block font-display text-headline-sm text-brand-dark">CoreFusion</span>
          <p className="mb-8 max-w-xs font-body text-body-sm leading-relaxed text-ink-muted">
            Engineering excellence for a digital world. We provide high-performance solutions for
            complex enterprise challenges.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex size-10 items-center justify-center rounded-full border border-brand/20 text-brand-dark transition-colors hover:bg-brand/10"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="flex size-10 items-center justify-center rounded-full border border-brand/20 text-brand-dark transition-colors hover:bg-brand/10"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark">Solutions</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {SOLUTIONS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition-colors hover:text-accent-cyan">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark">Resources</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {RESOURCES.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition-colors hover:text-accent-cyan">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark">Company</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {COMPANY.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition-colors hover:text-accent-cyan">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Headquarters + Global Offices */}
        <div>
          <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark">Headquarters</h4>
          <p className="mb-8 flex items-start gap-2 font-body text-body-sm text-ink-muted">
            <Icon name="location_on" className="mt-0.5 shrink-0 text-base text-brand" />
            {HQ}
          </p>
          <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark">Global Offices</h4>
          <ul className="space-y-3 font-body text-body-sm text-ink-muted">
            {OFFICES.map((office) => (
              <li key={office} className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                {office}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="mx-auto mt-12 flex max-w-container flex-col items-center justify-between gap-6 border-t border-ink/10 pb-4 pt-10 md:flex-row">
        <div className="flex items-center gap-3">
          <Icon name="public" className="text-xl text-brand" />
          <p className="font-body text-body-sm text-ink-muted">
            &copy; 2026 CoreFusion Technologies. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8 font-label-caps text-label-caps uppercase tracking-widest text-ink-muted">
          <Link to="/privacy" className="transition-colors hover:text-accent-cyan">Privacy Policy</Link>
          <Link to="/terms" className="transition-colors hover:text-accent-cyan">Terms of Service</Link>
          <Link to="/cookies" className="transition-colors hover:text-accent-cyan">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
