import { prisma } from '../../db/client';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from './checklist.schema';

const itemOrder = [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];

export const checklistRepository = {
  // ── Member helpers ──────────────────────────────────────────────────────────

  findMember: (tripId: string, userId: string) =>
    prisma.tripMember.findFirst({ where: { tripId, userId, isPending: false } }),

  findOwnerMember: (tripId: string) =>
    prisma.tripMember.findFirst({
      where: { tripId, role: 'OWNER' },
      include: { user: { select: { id: true, name: true } } },
    }),

  setVisibility: (memberId: string, isPublic: boolean) =>
    prisma.tripMember.update({
      where: { id: memberId },
      data: { checklistIsPublic: isPublic },
      select: { checklistIsPublic: true },
    }),

  // ── Categories ──────────────────────────────────────────────────────────────

  findAllCategories: (memberId: string) =>
    prisma.personalChecklistCategory.findMany({
      where: { memberId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        items: { orderBy: itemOrder },
      },
    }),

  findCategoryById: (id: string, memberId: string) =>
    prisma.personalChecklistCategory.findFirst({ where: { id, memberId } }),

  createCategory: (memberId: string, input: CreateCategoryInput) =>
    prisma.personalChecklistCategory.create({
      data: { memberId, ...input },
      include: { items: { orderBy: itemOrder } },
    }),

  updateCategory: (id: string, input: UpdateCategoryInput) =>
    prisma.personalChecklistCategory.update({
      where: { id },
      data: input,
      include: { items: { orderBy: itemOrder } },
    }),

  deleteCategory: (id: string) =>
    prisma.personalChecklistCategory.delete({ where: { id } }),

  // ── Items ───────────────────────────────────────────────────────────────────

  findUncategorized: (memberId: string) =>
    prisma.personalChecklistItem.findMany({
      where: { memberId, categoryId: null },
      orderBy: itemOrder,
    }),

  findById: (id: string, memberId: string) =>
    prisma.personalChecklistItem.findFirst({ where: { id, memberId } }),

  create: (memberId: string, input: CreateChecklistItemInput) =>
    prisma.personalChecklistItem.create({ data: { memberId, ...input } }),

  update: (id: string, input: UpdateChecklistItemInput) =>
    prisma.personalChecklistItem.update({ where: { id }, data: input }),

  delete: (id: string) =>
    prisma.personalChecklistItem.delete({ where: { id } }),
};
