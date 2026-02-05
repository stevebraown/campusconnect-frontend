import GlassCard from './GlassCard';
import Button from './Button';
import Icon from './Icon';

/**
 * Reusable glass empty state component.
 * @param {Object} props
 * @param {React.ComponentType|string} props.icon - Icon component or emoji string (deprecated)
 * @param {string} props.title
 * @param {string} props.description
 * @param {Function} props.action
 * @param {string} props.actionLabel
 */
function EmptyState({ icon, title, description, action, actionLabel }) {
  // Default icon if none provided
  const defaultIcon = icon || '✨';
  const isEmoji = typeof defaultIcon === 'string';
  
  return (
    <GlassCard className="text-center py-12">
      <div className="mb-4 flex justify-center" aria-hidden="true">
        {isEmoji ? (
          <div className="text-6xl">{defaultIcon}</div>
        ) : (
          <Icon icon={defaultIcon} size={64} className="text-[var(--accent)]" decorative />
        )}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 mb-4">{description}</p>
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </GlassCard>
  );
}

export default EmptyState;
