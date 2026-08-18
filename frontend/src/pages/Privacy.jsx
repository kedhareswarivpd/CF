import LegalContent from '../components/legal/LegalContent.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { privacyPolicy } from '../data/legal.js';

export default function Privacy() {
  useDocumentTitle('Privacy Policy | CoreFusion Technologies');
  return (
    <div className="flex-1 bg-brand-dark pb-section-padding">
      <LegalContent content={privacyPolicy} />
    </div>
  );
}
