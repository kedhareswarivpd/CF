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
      className="relative flex h-7 w-14 items-center rounded-full border border-outline-variant bg-slate-100 px-1 transition-colors duration-300 dark:border-dark-outline-variant dark:bg-dark-surface-low"
    >
      <span
        className={`absolute left-1 flex size-5 items-center justify-center rounded-full text-xs shadow transition-all duration-300 ${
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
      className={`fixed top-0 z-50 w-full border-b border-outline-variant transition-all duration-300 ${
        scrolled ? 'h-16 bg-white shadow-sm dark:bg-dark-surface' : 'h-20 bg-white dark:bg-dark-surface'
      }`}
    >
      <div className="flex size-full items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="flex shrink-0 items-center gap-2">
<div className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-brand/20 md:size-11">
  <img
    src="/logo.jpeg"
    alt="CoreFusion"
    className="size-full scale-110 object-cover"
  />
</div>
            <span className="font-display text-xl font-bold tracking-tight text-brand-dark dark:text-white">
              Core<span className="text-brand">Fusion</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
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
              className="border-b-2 border-transparent pb-1 font-label-caps text-label-caps uppercase text-ink-muted transition-colors duration-200 hover:text-brand dark:text-white dark:hover:text-dark-brand"
            >
              Login
            </NavLink>
            <Link
              to="/register"
              className="rounded bg-brand px-4 py-2 font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark"
            >
              Register
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button
            className="p-2 text-brand md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-4 border-t border-outline-variant bg-white px-margin-mobile py-stack-md dark:border-dark-outline-variant dark:bg-dark-surface md:hidden">
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
            className="font-label-caps text-label-caps uppercase text-ink-muted transition-colors hover:text-brand dark:text-white"
          >
            Login
          </NavLink>
          <Link
            to="/register"
            onClick={() => setMobileOpen(false)}
            className="rounded bg-brand px-4 py-2 text-center font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark"
          >
            Register
          </Link>
        </nav>
      )}

    </header>
  );
}
