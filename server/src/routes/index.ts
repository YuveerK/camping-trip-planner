import { Router } from 'express';
import authRoutes from './auth.routes';
import tripsRoutes from './trips.routes';
import membersRoutes from './members.routes';
import packingRoutes from './packing.routes';
import claimsRoutes from './claims.routes';
import tasksRoutes from './tasks.routes';
import mealsRoutes from './meals.routes';
import expensesRoutes from './expenses.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trips', tripsRoutes);
router.use('/trips/:tripId/members', membersRoutes);
router.use('/trips/:tripId/packing-items', packingRoutes);
router.use('/packing-items/:itemId/claims', claimsRoutes);
router.use('/trips/:tripId/tasks', tasksRoutes);
router.use('/trips/:tripId/meals', mealsRoutes);
router.use('/trips/:tripId/expenses', expensesRoutes);

export default router;
