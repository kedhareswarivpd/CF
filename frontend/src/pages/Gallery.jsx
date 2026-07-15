import GalleryHero from '../components/gallery/GalleryHero.jsx';
import GalleryGrid from '../components/gallery/GalleryGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { albums } from '../data/gallery.js';

export default function Gallery() {
  useDocumentTitle('Gallery | CoreFusion Technologies');
  return (
    <>
      <GalleryHero />
      <SectionHeading
        eyebrow="Our Story in Pictures"
        title="Photo Gallery"
        description="Browse through albums from our events, office life, and community initiatives."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      <GalleryGrid albums={albums} />
      <CtaBanner />
    </>
  );
}
