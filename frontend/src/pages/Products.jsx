import ProductsHero from '../components/products/ProductsHero.jsx';
import ProductsGrid from '../components/products/ProductsGrid.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { products } from '../data/products.js';

export default function Products() {
  useDocumentTitle('Our Products | CoreFusion Technologies');
  return (
    <>
      <ProductsHero />
      <SectionHeading
        eyebrow="Product Suite"
        title="Platforms Built for Enterprise"
        description="Battle-tested products that power analytics, security, integration, and DevOps for global organizations."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pt-section-padding"
      />
      <ProductsGrid products={products} />
      <CtaBanner />
    </>
  );
}
