import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Breadcrumbs from '../ui/Breadcrumbs.jsx';
import useScrollToTop from '../../hooks/useScrollToTop.js';
import { THEME_STORAGE_KEY } from '../../context/ThemeContext.jsx';
import { portalPaths } from '../../data/portal.js';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useScrollToTop();

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // Instant page switch — no fade delay
  useEffect(() => {
    const el = mainRef.current;
    if (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  }, [pathname]);

  const isPortal = portalPaths.some((p) => pathname.startsWith(`/${p}`));

  return (
    <div className="flex min-h-screen flex-col bg-surface-white dark:bg-dark-surface">
      {!isPortal && <Navbar />}
      <main ref={mainRef} className={`flex-1 ${isPortal ? '' : 'pt-20'}`}>
        {!isPortal && pathname !== '/' && (
          <div className="mx-auto max-w-container px-margin-mobile pt-4 md:px-margin-desktop">
            <Breadcrumbs />
          </div>
        )}
        <Outlet />
      </main>
      {!isPortal && <Footer />}
    </div>
  );
}
