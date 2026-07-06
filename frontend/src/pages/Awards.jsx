import AwardsHero from '../components/awards/AwardsHero.jsx';
import AwardsGrid from '../components/awards/AwardsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { awards, awardYearFilters } from '../data/awards.js';

export default function Awards() {
  useDocumentTitle('Awards & Recognition | CoreFusion Technologies');
  return (
    <>
      <AwardsHero />
      <SectionHeading
        eyebrow="Recognition"
        title="Awards & Certifications"
        description="Industry recognition that validates our commitment to excellence."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pt-section-padding"
      />
      <AwardsGrid awards={awards} yearFilters={awardYearFilters} />
      <CtaBanner />
    </>
  );
}
