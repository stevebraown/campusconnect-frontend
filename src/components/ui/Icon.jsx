/**
 * Icon Component
 * Wrapper for Lucide React icons with consistent styling
 */

import { memo } from 'react';
import clsx from 'clsx';

/**
 * Icon component that wraps Lucide React icons
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.size - Icon size (default: 20)
 * @param {boolean} props.decorative - If true, adds aria-hidden
 * @param {string} props.ariaLabel - Accessible label for the icon
 */
function Icon({ 
  icon: IconComponent, 
  className, 
  size = 20, 
  decorative = false,
  ariaLabel,
  ...props 
}) {
  if (!IconComponent) return null;

  return (
    <IconComponent
      size={size}
      className={clsx('flex-shrink-0', className)}
      aria-hidden={decorative || !ariaLabel}
      aria-label={ariaLabel}
      {...props}
    />
  );
}

export default memo(Icon);
