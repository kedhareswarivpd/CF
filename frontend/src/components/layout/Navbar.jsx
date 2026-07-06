import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-label-caps text-label-caps uppercase pb-1 border-b-2 transition-colors duration-200 ${
                    isActive
                      ? 'text-brand dark:text-dark-brand border-brand dark:border-dark-brand'
                      : 'text-ink-muted dark:text-dark-ink-muted border-transparent dark:border-transparent hover:text-brand dark:hover:text-dark-brand'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden lg:flex items-center bg-surface-container dark:bg-dark-surface-container px-4 py-2 rounded-full border border-outline-variant dark:border-dark-outline-variant">
            <Icon name="search" className="text-outline mr-2 text-body-lg leading-none" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-body-sm w-28"
            />
          </div>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/employee" className="text-body-sm text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand transition-colors font-label-caps text-label-caps uppercase">
                Employee
              </Link>
              <Link to="/client" className="text-body-sm text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand transition-colors font-label-caps text-label-caps uppercase">
                Portal
              </Link>
              <Link to="/admin" className="text-body-sm text-ink-muted dark:text-dark-ink-muted hover:text-brand dark:hover:text-dark-brand transition-colors font-label-caps text-label-caps uppercase">
                Admin
              </Link>
              <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
                Hi, <span className="font-semibold text-ink dark:text-dark-ink">{(user.user_metadata?.name || user.email || 'User').split(' ')[0]}</span>
              </span>
              <button
                onClick={logout}
                className="border border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-brand dark:hover:border-dark-brand hover:text-brand dark:hover:text-dark-brand transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : null}

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
          {isAuthenticated ? (
            <>
              <Link to="/employee" onClick={() => setMobileOpen(false)} className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">
                Employee Portal
              </Link>
              <Link to="/client" onClick={() => setMobileOpen(false)} className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">
                Client Portal
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">
                Admin Panel
              </Link>
              <button onClick={logout} className="border border-outline-variant dark:border-dark-outline-variant text-ink-muted dark:text-dark-ink-muted px-6 py-2.5 rounded font-label-caps text-label-caps uppercase w-full">
                Sign Out ({user.name.split(' ')[0]})
              </button>
            </>
          ) : null}
        </nav>
      )}

    </header>
  );
}
