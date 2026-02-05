/**
 * CampusConnect Logo Component
 * Displays the CampusConnect logo with proper sizing and accessibility
 */

import { Link } from 'react-router-dom';
import Icon from './Icon';
import { GraduationCap } from './icons';

// Import logo - adjust import path once file is added to src/assets/branding/
// Place logo file at: src/assets/branding/campusconnect-logo.png
// Then uncomment the line below:
// import logoImage from '../../assets/branding/campusconnect-logo.png';

// For now, using a fallback icon until logo file is added
const logoImage = null; // Will be set once logo file is added

/**
 * Logo component
 * @param {Object} props
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.showText - Whether to show "CampusConnect" text next to logo
 * @param {boolean} props.linkToHome - Whether to wrap logo in a Link to home
 * @param {string} props.className - Additional CSS classes
 */
function Logo({ 
  size = 'md', 
  showText = true, 
  linkToHome = true,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-20 w-20 md:h-24 md:w-24',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl md:text-3xl',
  };

  const LogoImage = () => {
    if (logoImage) {
      return (
        <img
          src={logoImage}
          alt="CampusConnect"
          className={`${sizeClasses[size]} object-contain flex-shrink-0`}
        />
      );
    }
    // Fallback icon if logo file doesn't exist yet
    const iconSize = size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 32 : 48;
    return (
      <Icon 
        icon={GraduationCap} 
        size={iconSize} 
        className="text-[var(--accent)] flex-shrink-0" 
        decorative 
      />
    );
  };

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoImage />
      {showText && (
        <span className={`font-bold tracking-tight text-white ${textSizeClasses[size]}`}>
          CampusConnect
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="CampusConnect Home">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

export default Logo;
