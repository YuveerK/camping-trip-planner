import { prisma } from '../config/database';
import type { CreateTaskInput, UpdateTaskInput } from '../validators/tasks.validators';

const TASK_INCLUDE = {
  assignedTo: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  createdBy: { select: { id: true, name: true } },
};

export class TasksService {
  async getTasks(tripId: string) {
    return prisma.task.findMany({
      where: { tripId },
      include: TASK_INCLUDE,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createTask(tripId: string, userId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: {
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        tripId,
        createdById: userId,
      },
      include: TASK_INCLUDE,
    });
  }

  async updateTask(tripId: string, taskId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findFirst({ where: { id: taskId, tripId } });
    if (!task) throw new Error('NOT_FOUND');
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...input,
        dueDate: input.dueDate !== undefined
          ? (input.dueDate ? new Date(input.dueDate) : null)
          : undefined,
      },
      include: TASK_INCLUDE,
    });
  }

  async deleteTask(tripId: string, taskId: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, tripId } });
    if (!task) throw new Error('NOT_FOUND');
    return prisma.task.delete({ where: { id: taskId } });
  }
}
