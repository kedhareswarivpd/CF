import { homeStats } from '../../data/home.js';
import Reveal from '../ui/Reveal.jsx';

export default function StatsBar({ stats }) {
  const items = stats
    ? [
        { label: 'Projects Delivered', value: `${stats.total_projects}+` },
        { label: 'Enterprise Clients', value: `${stats.total_clients}+` },
        { label: 'Countries Served', value: `${stats.countries}+` },
        { label: 'Uptime SLA', value: `${stats.uptime}%` },
      ]
    : homeStats;
  return (
    <section className="bg-white border-b border-outline-variant py-stack-lg px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-4 gap-stack-lg text-center">
        {items.map((stat, i) => (
          <Reveal key={stat.label} from="zoom" delay={i * 80}>
            <div className="font-stat text-stat-lg text-brand">{stat.value}</div>
            <div className="font-label-caps text-label-caps uppercase text-ink-muted mt-1">{stat.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
