import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createChecklistItemSchema = z.object({
  text: z.string().min(1, 'Item text is required').max(300),
  categoryId: z.preprocess((v) => (v === '' ? null : v), z.string().cuid().nullable().optional()),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().min(1).max(300).optional(),
  isChecked: z.boolean().optional(),
  categoryId: z.preprocess((v) => (v === '' ? null : v), z.string().cuid().nullable().optional()),
  sortOrder: z.number().int().min(0).optional(),
});

export const visibilitySchema = z.object({
  isPublic: z.boolean(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
export type VisibilityInput = z.infer<typeof visibilitySchema>;
