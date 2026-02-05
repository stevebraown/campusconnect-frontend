import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import clsx from 'clsx';

/**
 * Glass card that leans toward cursor.
 */
function MagneticCard({ children, className, intensity = 16, ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 12 });
  const springY = useSpring(y, { stiffness: 120, damping: 12 });
  const rotateX = useTransform(springY, [ -intensity, intensity ], [ intensity / 2, -intensity / 2 ]);
  const rotateY = useTransform(springX, [ -intensity, intensity ], [ -intensity / 2, intensity / 2 ]);

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const deltaX = e.clientX - (rect.left + rect.width / 2);
    const deltaY = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(Math.min(deltaX, intensity), -intensity));
    y.set(Math.max(Math.min(deltaY, intensity), -intensity));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, x: springX, y: springY, transformStyle: 'preserve-3d' }}
      className={clsx(
        'glass-panel glass-hover frosted border-white/10',
        'rounded-2xl border p-6 backdrop-blur-2xl',
        'transition-transform duration-200 will-change-transform',
        className
      )}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default MagneticCard;
