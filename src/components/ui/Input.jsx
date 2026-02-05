import clsx from 'clsx';

/**
 * Glass input field with focus glow.
 */
function Input({ className, label, hint, error, icon, ...props }) {
  return (
    <label className="block space-y-2 text-sm text-white">
      {label && <span className="font-semibold tracking-tight block text-white">{label}</span>}
      <div
        className={clsx(
          'relative flex items-center rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl transition-all duration-200',
          'focus-within:border-[var(--accent)]/70 focus-within:bg-black/40 focus-within:shadow-[0_0_0_2px_rgba(46,204,113,0.3),0_14px_40px_rgba(0,0,0,0.35)]',
          error && 'border-red-400/70 bg-red-500/10 shadow-[0_0_0_1px_rgba(248,113,113,0.4)]',
          className
        )}
      >
        {icon && <span className="pl-3 text-lg text-white/70">{icon}</span>}
        <input
          className="w-full bg-transparent px-4 py-3 text-base text-white font-500 placeholder:text-white/50 focus:outline-none"
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-white/70">{hint}</p>}
      {error && <p className="text-xs text-red-200">{error}</p>}
    </label>
  );
}

export default Input;
