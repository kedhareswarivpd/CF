import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

const NAV_LINKS = [
  { label: 'Solutions', to: '/solutions' },
  { label: 'Products', to: '/products' },
  { label: 'Technologies', to: '/technologies' },
  { label: 'Industries', to: '/industries' },
  { label: 'Resources', to: '/resources' },
  { label: 'Blog', to: '/blog' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
];

const PORTALS = [
  { label: 'Client Portal', to: '/client', icon: 'person' },
  { label: 'Employee Portal', to: '/employee', icon: 'badge' },
  { label: 'Partner Portal', to: '/partner', icon: 'handshake' },
  { label: 'Admin Panel', to: '/admin', icon: 'admin_panel_settings' },
];

function PortalsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 font-label-caps text-label-caps uppercase pb-1 border-b-2 transition-colors duration-200 ${
          open ? 'text-brand border-brand' : 'text-ink-muted dark:text-dark-ink-muted border-transparent hover:text-brand dark:hover:text-dark-brand'
        }`}
      >
        Portals
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-base leading-none" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-3 w-52 bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg shadow-card-hover py-2 z-50">
          {PORTALS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-ink-muted dark:text-dark-ink-muted hover:bg-surface-low dark:hover:bg-dark-surface-low hover:text-brand dark:hover:text-dark-brand transition-colors"
            >
              <Icon name={p.icon} className="text-brand text-base" />
              {p.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 border-b border-outline-variant transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md shadow-sm h-16' : 'bg-surface-white dark:bg-dark-surface h-20'
      }`}
    >
      <div className="max-w-container mx-auto h-full px-margin-mobile md:px-margin-desktop flex items-center justify-between">
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="font-display text-2xl md:text-3xl font-bold text-brand">
            CoreFusion
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-label-caps text-label-caps uppercase pb-1 border-b-2 transition-colors duration-200 ${
                    isActive
                      ? 'text-brand dark:text-dark-brand border-brand dark:border-dark-brand'
                      : 'text-ink-muted dark:text-dark-ink-muted border-transparent hover:text-brand dark:hover:text-dark-brand'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <PortalsDropdown />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="p-2 text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand transition-colors">
            <Icon name="search" className="text-xl leading-none" />
          </button>

          <button
            className="md:hidden p-2 text-brand"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-white dark:bg-dark-surface border-t border-outline-variant dark:border-dark-outline-variant px-margin-mobile py-stack-md flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `font-label-caps text-label-caps uppercase ${isActive ? 'text-brand dark:text-dark-brand' : 'text-ink-muted dark:text-dark-ink-muted'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted pt-2 border-t border-outline-variant">Portals</p>
          {PORTALS.map((p) => (
            <Link key={p.to} to={p.to} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted hover:text-brand transition-colors">
              <Icon name={p.icon} className="text-brand text-base" />
              {p.label}
            </Link>
          ))}
        </nav>
      )}

    </header>
  );
}
