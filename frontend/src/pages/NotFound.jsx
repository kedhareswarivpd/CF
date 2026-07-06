import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const QUICK_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/blog', label: 'Blog' },
  { to: '/faq', label: 'FAQ' },
];

export default function NotFound() {
  useDocumentTitle('Page Not Found | CoreFusion Technologies');
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container px-margin-mobile md:px-margin-desktop">
      <div className="text-center max-w-lg">
        <p className="font-stat text-stat-lg text-brand mb-4">404</p>
        <h1 className="font-display text-display-md text-brand-dark mb-4">Page Not Found</h1>
        <p className="text-body-md text-ink-muted mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or use
          the links below to find what you need.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-body-sm text-brand hover:text-brand-dark underline underline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-label-caps text-label-caps uppercase hover:bg-brand-dark transition-colors"
        >
          <Icon name="arrow_back" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
