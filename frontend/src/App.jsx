import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Portfolio from './pages/Portfolio.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Solutions from './pages/Solutions.jsx';
import Products from './pages/Products.jsx';
import Technologies from './pages/Technologies.jsx';
import Industries from './pages/Industries.jsx';
import CaseStudies from './pages/CaseStudies.jsx';
import Careers from './pages/Careers.jsx';
import Blog from './pages/Blog.jsx';
import Events from './pages/Events.jsx';
import Gallery from './pages/Gallery.jsx';
import Awards from './pages/Awards.jsx';
import Downloads from './pages/Downloads.jsx';
import Resources from './pages/Resources.jsx';
import Faq from './pages/Faq.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Cookies from './pages/Cookies.jsx';
import ClientPortal from './pages/ClientPortal.jsx';
import EmployeePortal from './pages/EmployeePortal.jsx';
import CookieConsent from './components/ui/CookieConsent.jsx';
import PartnerPortal from './pages/PartnerPortal.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import SuperAdminPanel from './pages/SuperAdminPanel.jsx';
import NotFound from './pages/NotFound.jsx';
import Register from './pages/Register.jsx';
import BrochurePage from './pages/BrochurePage.jsx';
import DownloadDetail from './pages/DownloadDetail.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="portfolio" element={<Portfolio />} />
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
          <Route path="employee" element={<EmployeePortal />} />
          <Route path="partner" element={<PartnerPortal />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="super-admin" element={<SuperAdminPanel />} />
          <Route path="register" element={<Register />} />
          <Route path="brochure" element={<BrochurePage />} />
          <Route path="download/:slug" element={<DownloadDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <CookieConsent />
    </>
  );
}
