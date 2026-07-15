import CaseStudiesHero from '../components/caseStudies/CaseStudiesHero.jsx';
import CaseStudiesGrid from '../components/caseStudies/CaseStudiesGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { caseStudies } from '../data/caseStudies.js';

export default function CaseStudies() {
  useDocumentTitle('Case Studies | CoreFusion Technologies');
  return (
    <>
      <CaseStudiesHero />
      <SectionHeading
        eyebrow="Proven Results"
        title="Success Stories Across Industries"
        description="Real-world impact delivered through technical excellence and deep domain expertise."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      <CaseStudiesGrid studies={caseStudies} />
      <CtaBanner />
    </>
  );
}
