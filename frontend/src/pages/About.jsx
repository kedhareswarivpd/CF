import { useEffect, useState } from 'react';
import AboutHero from '../components/about/AboutHero.jsx';
import MissionVision from '../components/about/MissionVision.jsx';
import ValuesGrid from '../components/about/ValuesGrid.jsx';
import Timeline from '../components/about/Timeline.jsx';
import LeadershipGrid from '../components/about/LeadershipGrid.jsx';
import GlobalPresence from '../components/about/GlobalPresence.jsx';
import Certifications from '../components/about/Certifications.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { getStats } from '../api/stats.js';

export default function About() {
  useDocumentTitle('About Us | CoreFusion Technologies');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => console.warn('Failed to fetch about stats, using fallback'));
  }, []);

  return (
    <>
      <AboutHero stats={stats} />
      <MissionVision />
      <ValuesGrid />
      <Timeline />
      <LeadershipGrid />
      <GlobalPresence />
      <Certifications />
    </>
  );
}
