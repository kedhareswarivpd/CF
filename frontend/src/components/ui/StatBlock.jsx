import useCountUp from '../../hooks/useCountUp.js';

export default function StatBlock({ value, label, valueClassName = 'text-brand', labelClassName = 'text-ink' }) {
  const [ref, display] = useCountUp(value);
  return (
    <div ref={ref}>
      <div className={`font-stat text-stat-lg ${valueClassName}`}>{display}</div>
      <div className={`font-label-caps text-label-caps uppercase ${labelClassName}`}>{label}</div>
    </div>
  );
}
