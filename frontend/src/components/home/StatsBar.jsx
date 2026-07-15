import { homeStats } from '../../data/home.js';
import Reveal from '../ui/Reveal.jsx';
import useCountUp from '../../hooks/useCountUp.js';

function AnimatedStat({ value, label }) {
  const [ref, display] = useCountUp(value);
  return (
    <div ref={ref}>
      <div className="font-stat text-stat-lg text-brand">{display}</div>
      <div className="font-label-caps text-label-caps uppercase text-ink-muted mt-1">{label}</div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const items = stats
    ? [
        { label: 'Projects Delivered', value: '430+' },
        { label: 'Enterprise Clients', value: `${stats.total_clients || 120}+` },
        { label: 'Countries Served', value: '18+' },
        { label: 'Uptime SLA', value: `${stats.uptime || 99.9}%` },
      ]
    : homeStats;
  return (
    <section className="bg-white border-b border-outline-variant py-stack-lg px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-4 gap-stack-lg text-center">
        {items.map((stat, i) => (
          <Reveal key={stat.label} from="zoom" delay={i * 80}>
            <AnimatedStat value={stat.value} label={stat.label} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
