import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ChecklistPage } from '../features/checklist/pages/ChecklistPage';
import { ExpensesPage } from '../features/expenses/pages/ExpensesPage';
import { MealsPage } from '../features/meals/pages/MealsPage';
import { MembersPage } from '../features/members/pages/MembersPage';
import { PackingListPage } from '../features/packing/pages/PackingListPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';
import { CreateTripPage } from '../features/trips/pages/CreateTripPage';
import { TripDashboardPage } from '../features/trips/pages/TripDashboardPage';
import { TripSettingsPage } from '../features/trips/pages/TripSettingsPage';
import { TripsListPage } from '../features/trips/pages/TripsListPage';
import { PrivateRoute, PublicRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trips" replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/trips" element={<TripsListPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route path="/trips/:tripId" element={<TripDashboardPage />} />
        <Route path="/trips/:tripId/packing" element={<PackingListPage />} />
        <Route path="/trips/:tripId/checklist" element={<ChecklistPage />} />
        <Route path="/trips/:tripId/tasks" element={<TasksPage />} />
        <Route path="/trips/:tripId/meals" element={<MealsPage />} />
        <Route path="/trips/:tripId/expenses" element={<ExpensesPage />} />
        <Route path="/trips/:tripId/members" element={<MembersPage />} />
        <Route path="/trips/:tripId/settings" element={<TripSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/trips" replace />} />
    </Routes>
  );
}
