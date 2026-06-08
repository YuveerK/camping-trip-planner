import { packingRepository } from './packing.repository';
import { AppError } from '../../utils/AppError';
import type { CreatePackingItemInput, UpdatePackingItemInput, CreateCategoryInput } from './packing.schema';
import { PACKING_TEMPLATE } from './packing.template';

export const packingService = {
  getCategories: (tripId: string) => packingRepository.findCategories(tripId),

  getItems: (tripId: string) => packingRepository.findItems(tripId),

  async getMissingItems(tripId: string) {
    const items = await packingRepository.findItems(tripId);
    return items.filter((item) => {
      const claimed = item.claims.reduce((sum, c) => sum + c.claimedQuantity, 0);
      return claimed < item.requiredQuantity;
    });
  },

  async createItem(tripId: string, userId: string, input: CreatePackingItemInput) {
    const existing = await packingRepository.findItemByName(tripId, input.name.trim());
    if (existing) throw new AppError(409, 'This item already exists in the packing list. You can claim it instead.');
    return packingRepository.createItem(tripId, userId, input);
  },

  async updateItem(tripId: string, itemId: string, input: UpdatePackingItemInput) {
    const item = await packingRepository.findItemById(itemId, tripId);
    if (!item) throw new AppError(404, 'Packing item not found');
    return packingRepository.updateItem(itemId, input);
  },

  async deleteItem(tripId: string, itemId: string) {
    const item = await packingRepository.findItemById(itemId, tripId);
    if (!item) throw new AppError(404, 'Packing item not found');
    return packingRepository.deleteItem(itemId);
  },

  async createCategory(tripId: string, input: CreateCategoryInput) {
    const sortOrder = await packingRepository.countCategories(tripId);
    return packingRepository.createCategory(tripId, input, sortOrder);
  },

  async deleteCategory(tripId: string, categoryId: string) {
    const category = await packingRepository.findCategoryById(tripId, categoryId);
    if (!category) throw new AppError(404, 'Packing category not found');
    return packingRepository.deleteCategoryWithItems(categoryId);
  },

  async loadTemplate(tripId: string, userId: string) {
    const existing = await packingRepository.countItems(tripId);
    if (existing > 0) throw new AppError(409, 'This trip already has packing items. Clear the list before loading a template.');
    await packingRepository.loadTemplate(tripId, userId, PACKING_TEMPLATE);
    return packingRepository.findCategories(tripId);
  },
};
