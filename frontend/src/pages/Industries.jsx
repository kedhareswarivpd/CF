import IndustriesHero from '../components/industries/IndustriesHero.jsx';
import IndustriesGrid from '../components/industries/IndustriesGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { industries } from '../data/industries.js';

export default function Industries() {
  useDocumentTitle('Industries We Serve | CoreFusion Technologies');
  return (
    <>
      <IndustriesHero />
      <SectionHeading
        eyebrow="Who We Serve"
        title="Industries Transformed by Technology"
        description="Domain expertise combined with technical excellence to address sector-specific challenges."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      <IndustriesGrid industries={industries} />
      <CtaBanner />
    </>
  );
}
