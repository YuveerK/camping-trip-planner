import { z } from 'zod';

export const createPackingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional().nullable(),
  requiredQuantity: z.number().int().min(1).default(1),
  unit: z.string().max(50).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  isSharedItem: z.boolean().default(true),
});

export const updatePackingItemSchema = createPackingItemSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreatePackingItemInput = z.infer<typeof createPackingItemSchema>;
export type UpdatePackingItemInput = z.infer<typeof updatePackingItemSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
