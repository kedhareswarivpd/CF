/**
 * Centralized navigation configuration.
 *
 * Both DesktopNavigation and MobileNavigation consume this single source
 * of truth — they can never drift out of sync.  Each top-level item is
 * either a plain link or a dropdown group whose `children` are the
 * sub-links.  `end: true` on a NavLink match means "exact match only"
 * (e.g. `/services` should not highlight when on `/services/cloud`).
 */

export const navigationConfig = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  {
    label: 'Services',
    children: [
      { label: 'All Services', to: '/services', end: true },
      { label: 'Software Development', to: '/services/software-development' },
      { label: 'Cloud & Infrastructure', to: '/services/cloud-infrastructure' },
      { label: 'AI & Automation', to: '/services/ai-automation' },
      { label: 'Cybersecurity', to: '/services/cybersecurity' },
      { label: 'Data & Analytics', to: '/services/data-analytics' },
    ],
  },
  {
    label: 'Solutions',
    children: [
      { label: 'All Solutions', to: '/solutions', end: true },
      { label: 'Products', to: '/products' },
      { label: 'Technologies', to: '/technologies' },
    ],
  },
  {
    label: 'Industries',
    children: [
      { label: 'All Industries', to: '/industries', end: true },
    ],
  },
  { label: 'Portfolio', to: '/portfolio' },
  {
    label: 'Resources',
    children: [
      { label: 'Case Studies', to: '/case-studies' },
      { label: 'Blog', to: '/blog' },
      { label: 'Events', to: '/events' },
      { label: 'Downloads', to: '/downloads' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    label: 'Company',
    children: [
      { label: 'Awards', to: '/awards' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  { label: 'Contact', to: '/contact' },
];
