import LegalContent from '../components/legal/LegalContent.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { termsOfService } from '../data/legal.js';

export default function Terms() {
  useDocumentTitle('Terms of Service | CoreFusion Technologies');
  return (
    <div className="pt-32">
      <LegalContent content={termsOfService} />
    </div>
  );
}
