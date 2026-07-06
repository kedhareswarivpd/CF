const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  inverse: 'bg-white text-brand hover:bg-accent-cyan-pale',
  outline: 'border border-outline-variant text-brand hover:border-brand',
  'outline-light': 'border border-white/40 text-white hover:bg-white/10',
};

const SIZES = {
  md: 'h-11 px-6 text-label-caps',
  lg: 'h-[52px] px-8 text-label-caps',
};

/**
 * Shared CTA button. Renders a <button> by default, or an <a>/router <Link>
 * when `as` is supplied (e.g. `as={Link} to="/services"`).
 */
export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'lg',
  className = '',
  icon,
  children,
  ...rest
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded font-stat uppercase tracking-wide font-semibold transition-all active:scale-95 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
      {icon}
    </Tag>
  );
}
