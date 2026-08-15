import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <Icon name={icon} className="mb-4 text-5xl text-ink-muted" />}
      <h3 className="mb-2 font-display text-headline-sm text-ink">{title}</h3>
      <p className="mb-6 max-w-md text-body-md text-ink-muted">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
