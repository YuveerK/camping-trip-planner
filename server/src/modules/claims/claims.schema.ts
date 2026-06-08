import { z } from 'zod';

export const createClaimSchema = z.object({
  claimedQuantity: z.number().int().min(1),
  notes: z.string().max(500).optional(),
});

export const updateClaimSchema = z.object({
  claimedQuantity: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
  isPacked: z.boolean().optional(),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
