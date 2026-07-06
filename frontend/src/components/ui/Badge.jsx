export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-block py-1 px-3 rounded-full font-label-caps text-label-caps uppercase ${className}`}
    >
      {children}
    </span>
  );
}
