import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChatOptional } from '../context/ChatContext';
import Icon from '../components/ui/Icon';
import {
  Home,
  User,
  Search,
  Users,
  MessageCircle,
  Settings,
  HelpCircle,
  Wrench,
  BookOpen,
  Puzzle,
  Map,
  BarChart3,
  TestTube,
  DoorOpen,
  Key,
  GraduationCap,
  X,
  Calendar,
} from '../components/ui/icons';

function SideMenu({ open, onClose, isAdmin = false }) {
  const { currentUser, logout, isAdmin: authIsAdmin } = useAuth();
  const chatContext = useChatOptional();
  const totalUnreadChats = chatContext?.totalUnreadChats ?? 0;
  const showAdmin = isAdmin || authIsAdmin;
  const location = useLocation();

  // Minimal navigation for unauthenticated users
  const guestItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/login', label: 'Login', icon: Key },
    { to: '/signup', label: 'Sign Up', icon: User },
    { to: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  // Full navigation for authenticated users
  const userItems = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/directory', label: 'People Directory', icon: Search },
    { to: '/groups', label: 'Communities', icon: Users },
    { to: '/events', label: 'Events & Timetable', icon: Calendar },
    { to: '/connections', label: 'Connections', icon: Users },
    { to: '/chat', label: 'Chat', icon: MessageCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help & Support', icon: HelpCircle },
    // Advanced / More
    { to: '/swifin', label: 'Swifin Solutions (Coming Soon)', icon: Key },
  ];

  const adminItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: Wrench },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/content', label: 'Content', icon: BookOpen },
    { to: '/admin/features', label: 'Features', icon: Puzzle },
    { to: '/admin/geofence', label: 'Geofence', icon: Map },
    { to: '/admin/groups', label: 'Communities', icon: Users },
    { to: '/admin/events', label: 'Events', icon: Calendar },
    // Admin-only AI monitoring (campusconnect-ai).
    { to: '/admin/ai-monitor', label: 'AI Monitor', icon: TestTube },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/system', label: 'System Status', icon: TestTube },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  // Determine which items to show
  const items = currentUser 
    ? (showAdmin ? adminItems : userItems)
    : guestItems;

  return (
    <Fragment>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 transform border-r border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Icon 
              icon={isAdmin ? Wrench : GraduationCap} 
              size={20} 
              className="text-[var(--accent)]" 
              decorative 
            />
            <span className="font-bold">{isAdmin ? 'Admin Menu' : 'Navigate'}</span>
          </div>
          <button
            aria-label="Close menu"
            className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/10"
            onClick={onClose}
          >
            <Icon icon={X} size={18} decorative />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-4 text-sm text-white/80">
          {currentUser ? (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-white/50">Signed in</p>
              <p className="font-semibold">{currentUser.email}</p>
              {showAdmin && <p className="text-[var(--accent)] font-semibold">Admin</p>}
            </div>
          ) : (
            <p>Not signed in</p>
          )}
        </div>

        <nav className="scrollbar-future flex flex-col gap-1 overflow-y-auto px-3 py-4 text-sm">
          {items.map((item) => {
            const active = location.pathname === item.to;
            const isChat = item.to === '/chat';
            const showBadge = isChat && totalUnreadChats > 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                  active
                    ? 'bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="relative">
                  <Icon 
                    icon={item.icon} 
                    size={20} 
                    className={active ? 'text-[var(--accent)]' : ''}
                    decorative 
                  />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center"
                      aria-label={`${totalUnreadChats} unread conversations`}
                    >
                      {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                    </span>
                  )}
                </span>
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}

          {currentUser && (
            <button
              className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-red-200 transition-all hover:bg-red-500/10 hover:text-white"
              onClick={async () => {
                await logout();
                onClose();
              }}
            >
              <Icon icon={DoorOpen} size={20} decorative />
              <span className="font-semibold">Logout</span>
            </button>
          )}
        </nav>
      </aside>
    </Fragment>
  );
}

export default SideMenu;
