export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-semibold ring-2 ring-brand/30 ring-offset-2 ring-offset-surface-container dark:ring-offset-dark-surface-container shrink-0 select-none ${className}`}
      title={name}
    >
      {initials || '?'}
    </div>
  );
}
