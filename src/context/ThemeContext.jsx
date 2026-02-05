import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Theme context controlling light/dark modes with animated transitions.
 * Uses document root class to keep Tailwind `dark` working while animating overlays.
 */
const ThemeContext = createContext();

const STORAGE_KEY = 'cc-theme';

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTransitioning(true);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    setTimeout(() => setTransitioning(false), 900);
  };

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, transitioning }),
    [theme, transitioning]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="relative min-h-screen bg-[var(--bg-obsidian)]">
        <AnimatePresence initial={false}>
          {transitioning && (
            <motion.div
              key={theme}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 0.35, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="pointer-events-none fixed inset-0 z-[60] bg-gradient-to-br from-emerald-400/20 via-indigo-400/10 to-cyan-300/16 mix-blend-screen"
            />
          )}
        </AnimatePresence>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
