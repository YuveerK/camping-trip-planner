import { ReactNode } from 'react';
import { Link, useLocation, useParams, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api/trips';
import { useAuth } from '../hooks/useAuth';
import { clsx } from 'clsx';

interface TabItem {
  to: string;
  icon: string;
  label: string;
}

function useTripTabs(tripId: string): TabItem[] {
  return [
    { to: `/trips/${tripId}`, icon: '🏕️', label: 'Overview' },
    { to: `/trips/${tripId}/packing`, icon: '🎒', label: 'Packing' },
    { to: `/trips/${tripId}/tasks`, icon: '✅', label: 'Tasks' },
    { to: `/trips/${tripId}/meals`, icon: '🍖', label: 'Meals' },
    { to: `/trips/${tripId}/expenses`, icon: '💰', label: 'Expenses' },
    { to: `/trips/${tripId}/members`, icon: '👥', label: 'Members' },
  ];
}

export function TripLayout({ children }: { children: ReactNode }) {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const { user, logout } = useAuth();
  const tabs = useTripTabs(tripId!);

  const { data } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getOne(tripId!),
    enabled: !!tripId,
  });

  const trip = data?.data;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/trips" className="text-stone-400 hover:text-stone-600 transition-colors p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-stone-800 truncate">{trip?.name ?? '...'}</h1>
            {trip?.location && (
              <p className="text-xs text-stone-500 truncate">📍 {trip.location}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
          >
            Sign out
          </button>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="border-t border-stone-100 overflow-x-auto scrollbar-hide">
          <div className="max-w-2xl mx-auto flex">
            {tabs.map((tab) => {
              const isActive = tab.to === `/trips/${tripId}`
                ? location.pathname === tab.to
                : location.pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                    isActive
                      ? 'border-forest-500 text-forest-600'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
