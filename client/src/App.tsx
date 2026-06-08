import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/AuthContext';
import { PrivateRoute, PublicRoute } from './routes/PrivateRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { TripsListPage } from './pages/trips/TripsListPage';
import { CreateTripPage } from './pages/trips/CreateTripPage';
import { TripDashboardPage } from './pages/trips/TripDashboardPage';
import { PackingListPage } from './pages/trip/PackingListPage';
import { TasksPage } from './pages/trip/TasksPage';
import { MealsPage } from './pages/trip/MealsPage';
import { ExpensesPage } from './pages/trip/ExpensesPage';
import { MembersPage } from './pages/trip/MembersPage';
import { TripSettingsPage } from './pages/trip/TripSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Redirect root to trips */}
            <Route path="/" element={<Navigate to="/trips" replace />} />

            {/* Public routes (redirect if authenticated) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/trips" element={<TripsListPage />} />
              <Route path="/trips/new" element={<CreateTripPage />} />
              <Route path="/trips/:tripId" element={<TripDashboardPage />} />
              <Route path="/trips/:tripId/packing" element={<PackingListPage />} />
              <Route path="/trips/:tripId/tasks" element={<TasksPage />} />
              <Route path="/trips/:tripId/meals" element={<MealsPage />} />
              <Route path="/trips/:tripId/expenses" element={<ExpensesPage />} />
              <Route path="/trips/:tripId/members" element={<MembersPage />} />
              <Route path="/trips/:tripId/settings" element={<TripSettingsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/trips" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
