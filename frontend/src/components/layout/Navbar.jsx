import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';


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

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative w-14 h-7 rounded-full border border-outline-variant dark:border-dark-outline-variant bg-slate-100 dark:bg-dark-surface-low transition-colors duration-300 flex items-center px-1"
    >
      <span
        className={`absolute left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow ${
          dark ? 'translate-x-7 bg-brand text-white' : 'translate-x-0 bg-white text-amber-500'
        }`}
      >
        <Icon name={dark ? 'dark_mode' : 'light_mode'} className="text-sm leading-none" />
      </span>
    </button>
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
        scrolled ? 'bg-white dark:bg-dark-surface shadow-sm h-16' : 'bg-white dark:bg-dark-surface h-20'
      }`}
    >
      <div className="w-full h-full px-margin-mobile md:px-margin-desktop flex items-center justify-between">
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="flex items-center shrink-0 gap-2">
<div className="h-10 w-10 md:h-11 md:w-11 rounded-full overflow-hidden shrink-0 border-2 border-brand/20">
  <img
    src="/logo.jpeg"
    alt="CoreFusion"
    className="h-full w-full object-cover scale-110"
  />
</div>
            <span className="font-display font-bold text-xl text-brand-dark dark:text-white tracking-tight">
              Core<span className="text-brand">Fusion</span>
            </span>
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
                      : 'text-ink-muted dark:text-white border-transparent hover:text-brand dark:hover:text-dark-brand'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/login"
              className="font-label-caps text-label-caps uppercase pb-1 border-b-2 transition-colors duration-200 text-ink-muted dark:text-white border-transparent hover:text-brand dark:hover:text-dark-brand"
            >
              Login
            </NavLink>
            <Link
              to="/register"
              className="bg-brand text-white font-label-caps text-label-caps uppercase px-4 py-2 rounded hover:bg-brand-dark transition-all"
            >
              Register
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

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
                `font-label-caps text-label-caps uppercase ${isActive ? 'text-brand dark:text-dark-brand' : 'text-ink-muted dark:text-white'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-white hover:text-brand transition-colors"
          >
            Login
          </NavLink>
          <Link
            to="/register"
            onClick={() => setMobileOpen(false)}
            className="bg-brand text-white font-label-caps text-label-caps uppercase px-4 py-2 rounded text-center hover:bg-brand-dark transition-all"
          >
            Register
          </Link>
        </nav>
      )}

    </header>
  );
}
