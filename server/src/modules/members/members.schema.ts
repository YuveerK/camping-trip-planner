import { z } from 'zod';

export const addMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
