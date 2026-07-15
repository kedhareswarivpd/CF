import Badge from './Badge.jsx';

export default function StatusBadge({ variant = 'neutral', children, className = '' }) {
  return (
    <Badge className={`bg-status-${variant}-bg text-status-${variant}-text ${variant === 'neutral' ? 'dark:text-black' : ''} ${className}`}>
      {children}
    </Badge>
  );
}
