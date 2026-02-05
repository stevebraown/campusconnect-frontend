import clsx from 'clsx';
import { motion } from 'framer-motion';

/**
 * Futuristic button with glass + plasticity accents.
 * @param {Object} props
 * @param {'primary'|'ghost'|'danger'|'soft'} props.variant
 * @param {boolean} props.fullWidth
 * @param {React.ReactNode|string} props.icon - Icon component or emoji string (deprecated)
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  ...rest
}) {
  const styles = {
    primary:
      'bg-[var(--accent)] text-white border border-white/15 shadow-glow',
    ghost:
      'bg-white/5 text-[var(--text-primary)] border border-white/10 hover:border-white/20',
    danger:
      'bg-red-500/90 text-white border border-red-300/40 shadow-[0_10px_40px_rgba(239,68,68,0.35)]',
    soft:
      'bg-white/10 text-white/90 border border-white/10 backdrop-blur-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  // Check if icon is a string (emoji) or React component
  const isEmoji = typeof icon === 'string';

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1 }}
      className={clsx(
        'relative inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200 will-change-transform',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]',
        styles[variant],
        sizes[size],
        fullWidth && 'w-full justify-center',
        className
      )}
      {...rest}
    >
      {icon && (
        <span className={clsx('flex-shrink-0', isEmoji && 'text-base')} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </motion.button>
  );
}

export default Button;
