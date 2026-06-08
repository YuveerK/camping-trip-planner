import type { Trip } from '../../../types';
import { TripCard } from './TripCard';

export function TripsList({ trips, userId }: { trips: Trip[]; userId: string }) {
  return (
    <div className="flex flex-col gap-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} userId={userId} />
      ))}
    </div>
  );
}
