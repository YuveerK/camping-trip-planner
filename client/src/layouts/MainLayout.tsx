import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/trips', icon: '🗺️', label: 'Trips' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/trips" className="flex items-center gap-2 font-bold text-forest-700 text-lg">
            <span>⛺</span>
            <span>CampPlan</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500 hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
