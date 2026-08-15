import { useEffect, useState } from 'react';
import ResourcesHero from '../components/resources/ResourcesHero.jsx';
import ResourcesGrid from '../components/resources/ResourcesGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { resources as staticResources, resourceTypeFilters } from '../data/resources.js';
import { fetchResources } from '../api/cms.js';

function toFrontend(r) {
  return {
    slug: r.slug,
    title: r.title,
    description: r.description || '',
    resourceType: r.resource_type || 'Guide',
    author: 'CoreFusion Team',
    publishedAt: r.created_at ? r.created_at.slice(0, 10) : '',
    readTime: '',
    topics: [],
    featured: false,
  };
}

export default function Resources() {
  useDocumentTitle('Resources | CoreFusion Technologies');
  const [resources, setResources] = useState(staticResources);

  useEffect(() => {
    fetchResources()
      .then((res) => {
        const items = res?.data;
        if (Array.isArray(items) && items.length) setResources(items.map(toFrontend));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <ResourcesHero />
      <SectionHeading
        eyebrow="Knowledge Center"
        title="Expert Guides & Resources"
        description="Whitepapers, templates, and guides created by our engineering teams."
        align="center"
        className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop [&_h2]:!text-white [&_p]:!text-white"
      />
      <ResourcesGrid resources={resources} typeFilters={resourceTypeFilters} />
      <CtaBanner />
    </>
  );
}
