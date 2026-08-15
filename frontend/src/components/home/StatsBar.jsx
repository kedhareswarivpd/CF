import { homeStats } from '../../data/home.js';
import Reveal from '../ui/Reveal.jsx';
import useCountUp from '../../hooks/useCountUp.js';

function AnimatedStat({ value, label }) {
  const [ref, display] = useCountUp(value);
  return (
    <div ref={ref}>
      <div className="font-stat text-stat-lg text-brand">{display}</div>
      <div className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted">{label}</div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const items = stats
    ? [
        { label: 'Projects Delivered', value: `${stats.total_projects ?? 0}+` },
        { label: 'Enterprise Clients', value: `${stats.total_clients ?? 0}+` },
        { label: 'Countries Served', value: `${stats.countries ?? 0}+` },
        { label: 'Uptime SLA', value: stats.uptime ? `${stats.uptime}%` : 'High Availability' },
      ]
    : homeStats;
  return (
    <section className="border-b border-outline-variant bg-white px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-stack-lg text-center md:grid-cols-4">
        {items.map((stat, i) => (
          <Reveal key={stat.label} from="zoom" delay={i * 80}>
            <AnimatedStat value={stat.value} label={stat.label} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
