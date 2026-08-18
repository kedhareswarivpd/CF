import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';
import { employeePortalPaths } from './data/portal.js';
import CookieConsent from './components/ui/CookieConsent.jsx';
import usePageViewTracker from './hooks/usePageViewTracker.js';

// Route-level code splitting — each page is fetched only when visited, so the
// initial bundle stays small and the app paints fast.
const Home = lazy(() => import('./pages/Home.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const SuccessStory = lazy(() => import('./pages/SuccessStory.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Solutions = lazy(() => import('./pages/Solutions.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const Technologies = lazy(() => import('./pages/Technologies.jsx'));
const Industries = lazy(() => import('./pages/Industries.jsx'));
const CaseStudies = lazy(() => import('./pages/CaseStudies.jsx'));
const Careers = lazy(() => import('./pages/Careers.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Awards = lazy(() => import('./pages/Awards.jsx'));
const Downloads = lazy(() => import('./pages/Downloads.jsx'));
const Resources = lazy(() => import('./pages/Resources.jsx'));
const Faq = lazy(() => import('./pages/Faq.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Cookies = lazy(() => import('./pages/Cookies.jsx'));
const ClientPortal = lazy(() => import('./pages/ClientPortal.jsx'));
const EmployeePortal = lazy(() => import('./pages/EmployeePortal.jsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'));
const SuperAdminPanel = lazy(() => import('./pages/SuperAdminPanel.jsx'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const BrochurePage = lazy(() => import('./pages/BrochurePage.jsx'));
const DownloadDetail = lazy(() => import('./pages/DownloadDetail.jsx'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-white py-section-padding dark:bg-dark-surface">
      <LoadingSpinner />
    </div>
  );
}

export default function App() {
  usePageViewTracker();
  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/success/:slug" element={<SuccessStory />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="solutions" element={<Solutions />} />
            <Route path="products" element={<Products />} />
            <Route path="technologies" element={<Technologies />} />
            <Route path="industries" element={<Industries />} />
            <Route path="case-studies" element={<CaseStudies />} />
            <Route path="careers" element={<Careers />} />
            <Route path="blog" element={<Blog />} />
            <Route path="events" element={<Events />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="awards" element={<Awards />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="resources" element={<Resources />} />
            <Route path="faq" element={<Faq />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="cookies" element={<Cookies />} />
            <Route path="client" element={<ClientPortal />} />
            {employeePortalPaths.map((portalPath) => (
              <Route key={portalPath} path={portalPath} element={<EmployeePortal />} />
            ))}
            <Route path="admin" element={<AdminPanel />} />
            <Route path="super-admin" element={<SuperAdminPanel />} />
            <Route path="super-admin/login" element={<SuperAdminLogin />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<Register />} />
            <Route path="brochure" element={<BrochurePage />} />
            <Route path="download/:slug" element={<DownloadDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <CookieConsent />
    </>
  );
}