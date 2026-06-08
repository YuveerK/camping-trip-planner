import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { expensesService } from './expenses.service';

export const getExpenses = catchAsync(async (req: Request, res: Response) => {
  const data = await expensesService.getExpenses(req.params['tripId'] as string);
  res.json({ status: 'success', data });
});

export const createExpense = catchAsync(async (req: Request, res: Response) => {
  const expense = await expensesService.createExpense(req.params['tripId'] as string, req.body);
  res.status(201).json({ status: 'success', data: expense });
});

export const updateExpense = catchAsync(async (req: Request, res: Response) => {
  const expense = await expensesService.updateExpense(
    req.params['tripId'] as string,
    req.params['expenseId'] as string,
    req.body,
  );
  res.json({ status: 'success', data: expense });
});

export const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  await expensesService.deleteExpense(req.params['tripId'] as string, req.params['expenseId'] as string);
  res.status(204).send();
});
