import { z } from 'zod';

export const createChecklistItemSchema = z.object({
  text: z.string().min(1, 'Item text is required').max(300),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().min(1).max(300).optional(),
  isChecked: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
