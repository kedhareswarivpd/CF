import LegalContent from '../components/legal/LegalContent.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { privacyPolicy } from '../data/legal.js';

export default function Privacy() {
  useDocumentTitle('Privacy Policy | CoreFusion Technologies');
  return (
    <div className="pt-32">
      <LegalContent content={privacyPolicy} />
    </div>
  );
}
