import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { tasksService } from './tasks.service';

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await tasksService.getTasks(req.params['tripId']!);
  res.json({ status: 'success', data: tasks });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const task = await tasksService.createTask(req.params['tripId']!, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: task });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const task = await tasksService.updateTask(req.params['tripId']!, req.params['taskId']!, req.body);
  res.json({ status: 'success', data: task });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await tasksService.deleteTask(req.params['tripId']!, req.params['taskId']!);
  res.status(204).send();
});
