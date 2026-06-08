import { prisma } from '../../db/client';
import type { CreateTaskInput, UpdateTaskInput } from './tasks.schema';

const TASK_INCLUDE = {
  assignedTo: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  createdBy: { select: { id: true, name: true } },
};

export const tasksRepository = {
  findAll: (tripId: string) =>
    prisma.task.findMany({
      where: { tripId },
      include: TASK_INCLUDE,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    }),

  findById: (taskId: string, tripId: string) =>
    prisma.task.findFirst({ where: { id: taskId, tripId } }),

  create: (tripId: string, userId: string, input: CreateTaskInput) =>
    prisma.task.create({
      data: {
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        tripId,
        createdById: userId,
      },
      include: TASK_INCLUDE,
    }),

  update: (taskId: string, input: UpdateTaskInput) =>
    prisma.task.update({
      where: { id: taskId },
      data: {
        ...input,
        dueDate: input.dueDate !== undefined
          ? (input.dueDate ? new Date(input.dueDate) : null)
          : undefined,
      },
      include: TASK_INCLUDE,
    }),

  delete: (taskId: string) =>
    prisma.task.delete({ where: { id: taskId } }),
};
