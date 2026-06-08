import { prisma } from '../config/database';
import type { CreatePackingItemInput, UpdatePackingItemInput, CreateCategoryInput } from '../validators/packing.validators';

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

export class PackingService {
  async getCategories(tripId: string) {
    return prisma.packingCategory.findMany({
      where: { tripId },
      include: {
        items: {
          include: ITEM_INCLUDE,
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getItems(tripId: string) {
    return prisma.packingItem.findMany({
      where: { tripId },
      include: ITEM_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async getMissingItems(tripId: string) {
    const items = await this.getItems(tripId);
    return items.filter((item) => {
      const claimed = item.claims.reduce((sum, c) => sum + c.claimedQuantity, 0);
      return claimed < item.requiredQuantity;
    });
  }

  async createItem(tripId: string, userId: string, input: CreatePackingItemInput) {
    const normalizedName = input.name.trim().toLowerCase();
    const existing = await prisma.packingItem.findFirst({
      where: {
        tripId,
        name: { equals: normalizedName, mode: 'insensitive' },
      },
    });
    if (existing) throw new Error('DUPLICATE_ITEM');

    return prisma.packingItem.create({
      data: {
        ...input,
        name: input.name.trim(),
        tripId,
        createdById: userId,
      },
      include: ITEM_INCLUDE,
    });
  }

  async updateItem(tripId: string, itemId: string, input: UpdatePackingItemInput) {
    const item = await prisma.packingItem.findFirst({ where: { id: itemId, tripId } });
    if (!item) throw new Error('NOT_FOUND');
    return prisma.packingItem.update({
      where: { id: itemId },
      data: input,
      include: ITEM_INCLUDE,
    });
  }

  async deleteItem(tripId: string, itemId: string) {
    const item = await prisma.packingItem.findFirst({ where: { id: itemId, tripId } });
    if (!item) throw new Error('NOT_FOUND');
    return prisma.packingItem.delete({ where: { id: itemId } });
  }

  async createCategory(tripId: string, input: CreateCategoryInput) {
    const count = await prisma.packingCategory.count({ where: { tripId } });
    return prisma.packingCategory.create({
      data: { ...input, tripId, isCustom: true, sortOrder: count },
    });
  }
}
