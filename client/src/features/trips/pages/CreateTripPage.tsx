import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { CreateTripForm } from '../components/CreateTripForm';
import { useCreateTrip } from '../hooks/useTrips';

export function CreateTripPage() {
  const { mutate, isPending } = useCreateTrip();

  return (
    <MainLayout>
      <div className="page-container pt-6">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/trips" className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-stone-800">New Trip</h1>
        </div>
        <CreateTripForm isPending={isPending} onSubmit={(data) => mutate(data)} />
      </div>
    </MainLayout>
  );
}
