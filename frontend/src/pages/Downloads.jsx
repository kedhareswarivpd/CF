import DownloadsHero from '../components/downloads/DownloadsHero.jsx';
import DownloadsGrid from '../components/downloads/DownloadsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { downloads, downloadCategoryFilters } from '../data/downloads.js';

export default function Downloads() {
  useDocumentTitle('Downloads | CoreFusion Technologies');
  return (
    <>
      <DownloadsHero />
      <SectionHeading
        eyebrow="Resource Library"
        title="Download Our Materials"
        description="Access brochures, whitepapers, datasheets, and case studies."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      <DownloadsGrid downloads={downloads} categoryFilters={downloadCategoryFilters} />
      <CtaBanner />
    </>
  );
}
