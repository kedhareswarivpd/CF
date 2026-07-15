import { useEffect, useState } from 'react';
import Hero from '../components/home/Hero.jsx';
import StatsBar from '../components/home/StatsBar.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { supabase } from '../lib/supabase.js';

async function fetchStats() {
  const [{ count: total_projects }, { count: total_clients }] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
  ]);
  return { total_projects: 430, total_clients: total_clients || 120, countries: 18, uptime: 99.9 };
}

export default function Home() {
  useDocumentTitle('CoreFusion Technologies | Transforming Businesses Through Intelligent Digital Solutions');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <>
      <Hero />
      <StatsBar stats={stats} />
      <WhyChooseUs />
      <CtaBanner />
    </>
  );
}
