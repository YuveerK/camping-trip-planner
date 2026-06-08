import { Response } from 'express';
import { ExpensesService } from '../services/expenses.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const expensesService = new ExpensesService();

export async function getExpenses(req: AuthRequest, res: Response) {
  try {
    const data = await expensesService.getExpenses(req.params['tripId']!);
    return R.ok(res, data);
  } catch {
    return R.serverError(res);
  }
}

export async function createExpense(req: AuthRequest, res: Response) {
  try {
    const expense = await expensesService.createExpense(req.params['tripId']!, req.body);
    return R.created(res, expense, 'Expense added');
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_MEMBER') return R.badRequest(res, 'Invalid member selected');
    return R.serverError(res);
  }
}

export async function updateExpense(req: AuthRequest, res: Response) {
  try {
    const expense = await expensesService.updateExpense(req.params['tripId']!, req.params['expenseId']!, req.body);
    return R.ok(res, expense, 'Expense updated');
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}

export async function deleteExpense(req: AuthRequest, res: Response) {
  try {
    await expensesService.deleteExpense(req.params['tripId']!, req.params['expenseId']!);
    return R.noContent(res);
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}
