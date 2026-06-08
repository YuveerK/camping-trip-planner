import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenses.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTripAccess } from '../middleware/tripAccess.middleware';
import { validate } from '../middleware/validate.middleware';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expenses.validators';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', getExpenses);
router.post('/', validate(createExpenseSchema), createExpense);
router.patch('/:expenseId', validate(updateExpenseSchema), updateExpense);
router.delete('/:expenseId', deleteExpense);

export default router;
