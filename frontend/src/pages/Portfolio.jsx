import { useState } from 'react';
import PortfolioHero from '../components/portfolio/PortfolioHero.jsx';
import FilterBar from '../components/portfolio/FilterBar.jsx';
import FeaturedCaseStudy from '../components/portfolio/FeaturedCaseStudy.jsx';
import ProjectGallery from '../components/portfolio/ProjectGallery.jsx';
import GlobalMap from '../components/portfolio/GlobalMap.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function Portfolio() {
  useDocumentTitle('Project Portfolio | CoreFusion Technologies');

  const [industry, setIndustry] = useState('All');
  const [activeServices, setActiveServices] = useState([]);

  const toggleService = (service) => {
    setActiveServices((prev) => {
      if (prev.includes(service)) return prev.filter((s) => s !== service);
      if (prev.length >= 2) return prev;
      return [...prev, service];
    });
  };

  return (
    <>
      <PortfolioHero />
      <FilterBar
        industry={industry}
        onIndustryChange={setIndustry}
        activeServices={activeServices}
        onServiceToggle={toggleService}
      />
      <FeaturedCaseStudy />
      <ProjectGallery industry={industry} />
      <GlobalMap />
    </>
  );
}
