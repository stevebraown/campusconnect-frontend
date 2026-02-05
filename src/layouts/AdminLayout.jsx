// Admin shell layout and navigation
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import SideMenu from '../navigation/SideMenu';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Logo from '../components/ui/Logo';
import { Menu } from '../components/ui/icons';

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-white">
      {/* Admin header controls */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            icon={<Icon icon={Menu} size={18} decorative />}
            onClick={() => setMenuOpen(true)}
          >
            Admin Menu
          </Button>
          <Link to="/admin" className="flex items-center gap-3 text-xl font-bold">
            <Logo size="sm" showText={false} linkToHome={false} />
            <span>Admin Control</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">Back to App</Button>
          </Link>
        </div>
      </header>

      {/* Admin navigation panel */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Admin content */}
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Admin Oversight</p>
              <h1 className="text-xl font-bold">Control Surface</h1>
            </div>
            <div className="flex gap-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
              Synced
            </div>
          </div>
        </GlassCard>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
