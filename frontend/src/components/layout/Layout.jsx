import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Breadcrumbs from '../ui/Breadcrumbs.jsx';
import useScrollToTop from '../../hooks/useScrollToTop.js';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useScrollToTop();

  useEffect(() => {
    const stored = localStorage.getItem('corefusion.theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // Fade-in on every route change
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.2s cubic-bezier(0.22,1,0.36,1), transform 0.2s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const PORTAL_PATHS = ['/client', '/employee', '/admin', '/super-admin', '/login', '/register', '/sales', '/marketing', '/developer', '/project-manager', '/qa', '/support', '/finance', '/hr'];
  const isPortal = PORTAL_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col bg-surface-white dark:bg-dark-surface">
      <Navbar />
      <main ref={mainRef} className="flex-1 pt-20">
        {pathname !== '/' && (
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pt-4">
            <Breadcrumbs />
          </div>
        )}
        <Outlet />
      </main>
      {!isPortal && <Footer />}
    </div>
  );
}
