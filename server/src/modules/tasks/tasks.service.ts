import { tasksRepository } from './tasks.repository';
import { AppError } from '../../utils/AppError';
import type { CreateTaskInput, UpdateTaskInput } from './tasks.schema';

export const tasksService = {
  getTasks: (tripId: string) => tasksRepository.findAll(tripId),

  createTask: (tripId: string, userId: string, input: CreateTaskInput) =>
    tasksRepository.create(tripId, userId, input),

  async updateTask(tripId: string, taskId: string, input: UpdateTaskInput) {
    const task = await tasksRepository.findById(taskId, tripId);
    if (!task) throw new AppError(404, 'Task not found');
    return tasksRepository.update(taskId, input);
  },

  async deleteTask(tripId: string, taskId: string) {
    const task = await tasksRepository.findById(taskId, tripId);
    if (!task) throw new AppError(404, 'Task not found');
    return tasksRepository.delete(taskId);
  },
};
