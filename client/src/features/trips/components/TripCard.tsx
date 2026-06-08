import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import type { Trip } from '../../../types';
import { formatDateRange } from '../../../utils/date';

export function TripCard({ trip, userId }: { trip: Trip; userId: string }) {
  const isOwner = trip.createdById === userId;
  const memberCount = trip.members.length;

  return (
    <Link to={`/trips/${trip.id}`}>
      <Card hover className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-stone-800 text-base">{trip.name}</h3>
              {isOwner && <Badge variant="green">Owner</Badge>}
            </div>
            {trip.campsiteName && <p className="text-sm text-stone-500 mt-0.5 truncate">{trip.campsiteName}</p>}
            {trip.location && <p className="text-xs text-stone-400 truncate">{trip.location}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-stone-500">{formatDateRange(trip.checkInDate, trip.checkOutDate)}</span>
              <span className="text-xs text-stone-500">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
              {trip._count && <span className="text-xs text-stone-500">{trip._count.packingItems} items</span>}
            </div>
          </div>
          <svg className="w-5 h-5 text-stone-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
