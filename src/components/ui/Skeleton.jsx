import clsx from 'clsx';

/**
 * Glass skeleton loader to minimize CLS.
 */
function Skeleton({ className }) {
  return <div className={clsx('glass-skeleton animate-pulse-glass', className)} />;
}

export default Skeleton;
