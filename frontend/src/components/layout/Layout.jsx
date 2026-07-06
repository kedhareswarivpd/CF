import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Breadcrumbs from '../ui/Breadcrumbs.jsx';
import useScrollToTop from '../../hooks/useScrollToTop.js';

export default function Layout() {
  const { pathname } = useLocation();
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

  return (
    <div className="min-h-screen flex flex-col bg-surface-white dark:bg-dark-surface">
      <Navbar />
      <main className="flex-1 pt-20">
        {pathname !== '/' && (
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pt-4">
            <Breadcrumbs />
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
