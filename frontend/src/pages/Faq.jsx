import FaqSection from '../components/faq/FaqSection.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { faqCategories } from '../data/faq.js';

export default function Faq() {
  useDocumentTitle('FAQ | CoreFusion Technologies');
  return (
    <>
      <section className="bg-brand-dark text-white pt-32 pb-section-padding">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-3xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">FAQ</span>
            <h1 className="font-display text-headline-lg md:text-display-lg text-white mt-4 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-body-lg text-white/80 max-w-2xl">
              Quick answers to common questions about our services, engagement models, security practices, and careers.
            </p>
          </div>
        </div>
      </section>
      <FaqSection categories={faqCategories} />
      <CtaBanner />
    </>
  );
}
