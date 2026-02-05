// Main shell layout for authenticated and public pages
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SideMenu from '../navigation/SideMenu';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import Icon from '../components/ui/Icon';
import Logo from '../components/ui/Logo';
import { Menu, Wrench, Sun, Moon } from '../components/ui/icons';

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, isAdmin, username } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Build breadcrumbs from the current URL
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, idx, arr) => ({
      label: segment || 'home',
      path: `/${arr.slice(0, idx + 1).join('/')}`,
    }));

  return (
    <div className="relative min-h-screen text-white">
      {/* Sticky header with global actions */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              aria-label="Open menu"
              variant="ghost"
              onClick={() => setMenuOpen(true)}
              icon={<Icon icon={Menu} size={18} decorative />}
              className="border-white/10"
            >
              Menu
            </Button>
            <div className="flex items-center gap-3">
              <Logo size="md" showText />
              {currentUser && username && (
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Welcome, {username}!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  icon={<Icon icon={Wrench} size={18} decorative />}
                >
                  Admin
                </Button>
              </Link>
            )}
            <Button
              aria-label="Toggle theme"
              variant="ghost"
              onClick={toggleTheme}
              icon={
                theme === 'dark' ? (
                  <Icon icon={Moon} size={18} decorative />
                ) : (
                  <Icon icon={Sun} size={18} decorative />
                )
              }
            >
              {theme === 'dark' ? 'Dark' : 'Light'}
            </Button>
            {currentUser ? (
              <GlassCard className="px-4 py-2" padding="">
                <p className="text-xs uppercase tracking-wide text-white/60">Signed in</p>
                <p className="text-sm font-semibold text-white">{currentUser.email}</p>
              </GlassCard>
            ) : (
              <Link to="/login">
                <Button variant="primary">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out navigation */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main content area */}
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-4">
        <GlassCard className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-white/60">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>Live</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>Route</span>
            <div className="flex items-center gap-1">
              <Link to="/" className="hover:text-white">
                Home
              </Link>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.path} className="flex items-center gap-1">
                  <span className="text-white/40">/</span>
                  <Link to={crumb.path} className="capitalize hover:text-white">
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid gap-6"
        >
          <Outlet />
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-12 text-center text-xs text-white/60">
        Built with care · CampusConnect
      </footer>
    </div>
  );
}

export default MainLayout;
