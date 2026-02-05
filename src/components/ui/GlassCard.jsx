import clsx from 'clsx';
import { motion } from 'framer-motion';

/**
 * Glassmorphic card wrapper.
 */
function GlassCard({ children, className, padding = 'p-6', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ backgroundColor: 'transparent' }} // Explicitly set to avoid animation warning
      className={clsx(
        'glass-panel glass-hover frosted border-white/10',
        'shadow-[0_25px_80px_rgba(0,0,0,0.35)]',
        padding,
        className
      )}
      {...rest}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default GlassCard;
