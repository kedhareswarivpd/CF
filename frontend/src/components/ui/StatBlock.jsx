export default function StatBlock({ value, label, valueClassName = 'text-brand', labelClassName = 'text-ink' }) {
  return (
    <div>
      <div className={`font-stat text-stat-lg ${valueClassName}`}>{value}</div>
      <div className={`font-label-caps text-label-caps uppercase ${labelClassName}`}>{label}</div>
    </div>
  );
}
