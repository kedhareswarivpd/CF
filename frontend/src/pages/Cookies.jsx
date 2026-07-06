import LegalContent from '../components/legal/LegalContent.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { cookiePolicy } from '../data/legal.js';

export default function Cookies() {
  useDocumentTitle('Cookie Policy | CoreFusion Technologies');
  return (
    <div className="pt-32">
      <LegalContent content={cookiePolicy} />
    </div>
  );
}
