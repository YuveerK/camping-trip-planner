import { prisma } from '../../db/client';
import type { CreatePackingItemInput, UpdatePackingItemInput, CreateCategoryInput } from './packing.schema';
import type { PACKING_TEMPLATE } from './packing.template';

const ITEM_INCLUDE = {
  category: true,
  claims: {
    include: {
      member: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  },
  createdBy: { select: { id: true, name: true } },
};

export const packingRepository = {
  findCategories: (tripId: string) =>
    prisma.packingCategory.findMany({
      where: { tripId },
      include: { items: { include: ITEM_INCLUDE, orderBy: { name: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    }),

  findItems: (tripId: string) =>
    prisma.packingItem.findMany({
      where: { tripId },
      include: ITEM_INCLUDE,
      orderBy: { name: 'asc' },
    }),

  findItemById: (itemId: string, tripId: string) =>
    prisma.packingItem.findFirst({ where: { id: itemId, tripId } }),

  findItemByName: (tripId: string, name: string) =>
    prisma.packingItem.findFirst({
      where: { tripId, name: { equals: name, mode: 'insensitive' } },
    }),

  createItem: (tripId: string, userId: string, input: CreatePackingItemInput) =>
    prisma.packingItem.create({
      data: { ...input, name: input.name.trim(), tripId, createdById: userId },
      include: ITEM_INCLUDE,
    }),

  updateItem: (itemId: string, input: UpdatePackingItemInput) =>
    prisma.packingItem.update({
      where: { id: itemId },
      data: input,
      include: ITEM_INCLUDE,
    }),

  deleteItem: (itemId: string) =>
    prisma.packingItem.delete({ where: { id: itemId } }),

  countCategories: (tripId: string) =>
    prisma.packingCategory.count({ where: { tripId } }),

  createCategory: (tripId: string, input: CreateCategoryInput, sortOrder: number) =>
    prisma.packingCategory.create({
      data: { ...input, tripId, isCustom: true, sortOrder },
    }),

  countItems: (tripId: string) =>
    prisma.packingItem.count({ where: { tripId } }),

  loadTemplate: (
    tripId: string,
    userId: string,
    template: typeof PACKING_TEMPLATE,
  ) =>
    prisma.$transaction(async (tx) => {
      for (let ci = 0; ci < template.length; ci++) {
        const { category, items } = template[ci];
        const cat = await tx.packingCategory.create({
          data: { tripId, name: category, isCustom: true, sortOrder: ci },
        });
        for (let ii = 0; ii < items.length; ii++) {
          await tx.packingItem.create({
            data: {
              tripId,
              categoryId: cat.id,
              name: items[ii],
              createdById: userId,
              requiredQuantity: 1,
              priority: 'MEDIUM',
              isSharedItem: true,
            },
          });
        }
      }
    }),
};
