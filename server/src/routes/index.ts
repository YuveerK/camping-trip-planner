import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import tripsRoutes from '../modules/trips/trips.routes';
import membersRoutes from '../modules/members/members.routes';
import packingRoutes from '../modules/packing/packing.routes';
import claimsRoutes from '../modules/claims/claims.routes';
import tasksRoutes from '../modules/tasks/tasks.routes';
import mealsRoutes from '../modules/meals/meals.routes';
import expensesRoutes from '../modules/expenses/expenses.routes';
import checklistRoutes from '../modules/checklist/checklist.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trips', tripsRoutes);
router.use('/trips/:tripId/members', membersRoutes);
router.use('/trips/:tripId/packing-items', packingRoutes);
router.use('/packing-items/:itemId/claims', claimsRoutes);
router.use('/trips/:tripId/tasks', tasksRoutes);
router.use('/trips/:tripId/meals', mealsRoutes);
router.use('/trips/:tripId/expenses', expensesRoutes);
router.use('/trips/:tripId/checklist', checklistRoutes);

export default router;
