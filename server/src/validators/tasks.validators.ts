import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  assignedToMemberId: z.string().optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
