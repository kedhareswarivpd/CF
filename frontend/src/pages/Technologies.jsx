import TechHero from '../components/technologies/TechHero.jsx';
import TechGrid from '../components/technologies/TechGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { technologyCategories } from '../data/technologies.js';

export default function Technologies() {
  useDocumentTitle('Our Technology Stack | CoreFusion Technologies');
  return (
    <>
      <TechHero />
      <SectionHeading
        eyebrow="Our Expertise"
        title="Technologies We Master"
        description="Deep, hands-on proficiency across the tools and platforms that power modern enterprise."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      <TechGrid categories={technologyCategories} />
      <CtaBanner />
    </>
  );
}
