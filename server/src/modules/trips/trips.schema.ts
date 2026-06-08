import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(200),
  campsiteName: z.string().max(200).optional(),
  location: z.string().max(300).optional(),
  checkInDate: z.string().datetime({ offset: true }).optional().nullable(),
  checkOutDate: z.string().datetime({ offset: true }).optional().nullable(),
  description: z.string().max(2000).optional(),
  bookingReference: z.string().max(100).optional(),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
