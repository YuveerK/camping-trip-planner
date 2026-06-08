import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTripAccess } from '../../middleware/tripAccess.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createExpenseSchema, updateExpenseSchema } from './expenses.schema';
import * as expensesController from './expenses.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', expensesController.getExpenses);
router.post('/', validate(createExpenseSchema), expensesController.createExpense);
router.patch('/:expenseId', validate(updateExpenseSchema), expensesController.updateExpense);
router.delete('/:expenseId', expensesController.deleteExpense);

export default router;
