export default function Eyebrow({ children, className = '' }) {
  return (
    <span className={`block font-label-caps text-label-caps uppercase tracking-widest text-brand ${className}`}>
      {children}
    </span>
  );
}
