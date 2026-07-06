import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <Icon name={icon} className="text-5xl text-ink-muted mb-4" />}
      <h3 className="font-display text-headline-sm text-ink mb-2">{title}</h3>
      <p className="text-body-md text-ink-muted max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
