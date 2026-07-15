import SolutionsHero from '../components/solutions/SolutionsHero.jsx';
import SolutionsGrid from '../components/solutions/SolutionsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { solutions } from '../data/solutions.js';

export default function Solutions() {
  useDocumentTitle('Enterprise Solutions | CoreFusion Technologies');
  return (
    <>
      <SolutionsHero />
      <div className="bg-brand-dark">
        <SectionHeading
          eyebrow="Our Capabilities"
          title="Comprehensive Solution Portfolio"
          description="End-to-end enterprise solutions designed to address your most complex business and technology challenges."
          align="center"
          className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pb-stack-xl [&_p]:!text-white [&_h2]:!text-white"
        />
      </div>
      <SolutionsGrid solutions={solutions} />
      <CtaBanner />
    </>
  );
}
