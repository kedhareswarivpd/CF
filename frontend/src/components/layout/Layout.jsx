import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Breadcrumbs from '../ui/Breadcrumbs.jsx';
import useScrollToTop from '../../hooks/useScrollToTop.js';
import { portalPaths } from '../../data/portal.js';

export default function Layout() {
 const { pathname } = useLocation();
 const mainRef = useRef(null);
 useScrollToTop();

 // Theme init/persistence is owned exclusively by ThemeProvider (see
 // context/ThemeContext.jsx) — do not re-read localStorage/prefers-color-scheme here.

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
     <div className="mx-auto max-w-container px-4 pt-4 sm:px-6 lg:px-10 xl:px-12">
      <Breadcrumbs />
     </div>
    )}
    <Outlet />
   </main>
   {!isPortal && <Footer />}
  </div>
 );
}
