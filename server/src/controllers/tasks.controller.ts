import { Response } from 'express';
import { TasksService } from '../services/tasks.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const tasksService = new TasksService();

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const tasks = await tasksService.getTasks(req.params['tripId']!);
    return R.ok(res, tasks);
  } catch {
    return R.serverError(res);
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const task = await tasksService.createTask(req.params['tripId']!, req.user!.userId, req.body);
    return R.created(res, task, 'Task created');
  } catch {
    return R.serverError(res);
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const task = await tasksService.updateTask(req.params['tripId']!, req.params['taskId']!, req.body);
    return R.ok(res, task, 'Task updated');
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    await tasksService.deleteTask(req.params['tripId']!, req.params['taskId']!);
    return R.noContent(res);
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}
