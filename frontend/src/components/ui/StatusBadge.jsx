import Badge from './Badge.jsx';

const VARIANT_CLASSES = {
  success: 'bg-status-success-bg text-status-success-text',
  warning: 'bg-status-warning-bg text-status-warning-text',
  error: 'bg-status-error-bg text-status-error-text',
  info: 'bg-status-info-bg text-status-info-text',
  neutral: 'bg-status-neutral-bg text-status-neutral-text dark:text-black',
};

export default function StatusBadge({ variant = 'neutral', children, className = '' }) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral;
  return (
    <Badge className={`${variantClass} ${className}`}>
      {children}
    </Badge>
  );
}
