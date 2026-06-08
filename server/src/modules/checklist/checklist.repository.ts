import { prisma } from '../../db/client';
import type { CreateChecklistItemInput, UpdateChecklistItemInput } from './checklist.schema';

export const checklistRepository = {
  findMember: (tripId: string, userId: string) =>
    prisma.tripMember.findFirst({ where: { tripId, userId, isPending: false } }),

  findAll: (memberId: string) =>
    prisma.personalChecklistItem.findMany({
      where: { memberId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),

  findById: (id: string, memberId: string) =>
    prisma.personalChecklistItem.findFirst({ where: { id, memberId } }),

  create: (memberId: string, input: CreateChecklistItemInput) =>
    prisma.personalChecklistItem.create({
      data: { memberId, ...input },
    }),

  update: (id: string, input: UpdateChecklistItemInput) =>
    prisma.personalChecklistItem.update({
      where: { id },
      data: input,
    }),

  delete: (id: string) =>
    prisma.personalChecklistItem.delete({ where: { id } }),
};
