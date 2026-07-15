import ResourcesHero from '../components/resources/ResourcesHero.jsx';
import ResourcesGrid from '../components/resources/ResourcesGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { resources, resourceTypeFilters } from '../data/resources.js';

export default function Resources() {
  useDocumentTitle('Resources | CoreFusion Technologies');
  return (
    <>
      <ResourcesHero />
      <SectionHeading
        eyebrow="Knowledge Center"
        title="Expert Guides & Resources"
        description="Whitepapers, templates, and guides created by our engineering teams."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      <ResourcesGrid resources={resources} typeFilters={resourceTypeFilters} />
      <CtaBanner />
    </>
  );
}
