import { checklistRepository } from './checklist.repository';
import { AppError } from '../../utils/AppError';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from './checklist.schema';

async function resolveMember(tripId: string, userId: string) {
  const member = await checklistRepository.findMember(tripId, userId);
  if (!member) throw new AppError(403, 'You are not a member of this trip');
  return member;
}

async function getFullChecklist(memberId: string) {
  const [categories, uncategorized] = await Promise.all([
    checklistRepository.findAllCategories(memberId),
    checklistRepository.findUncategorized(memberId),
  ]);
  return { categories, uncategorized };
}

export const checklistService = {
  // ── Checklist (categories + uncategorized) ──────────────────────────────────

  async getItems(tripId: string, userId: string) {
    const member = await resolveMember(tripId, userId);
    return getFullChecklist(member.id);
  },

  // ── Categories ──────────────────────────────────────────────────────────────

  async createCategory(tripId: string, userId: string, input: CreateCategoryInput) {
    const member = await resolveMember(tripId, userId);
    return checklistRepository.createCategory(member.id, input);
  },

  async updateCategory(tripId: string, userId: string, categoryId: string, input: UpdateCategoryInput) {
    const member = await resolveMember(tripId, userId);
    const category = await checklistRepository.findCategoryById(categoryId, member.id);
    if (!category) throw new AppError(404, 'Category not found');
    return checklistRepository.updateCategory(categoryId, input);
  },

  async deleteCategory(tripId: string, userId: string, categoryId: string) {
    const member = await resolveMember(tripId, userId);
    const category = await checklistRepository.findCategoryById(categoryId, member.id);
    if (!category) throw new AppError(404, 'Category not found');
    return checklistRepository.deleteCategory(categoryId);
  },

  // ── Items ───────────────────────────────────────────────────────────────────

  async createItem(tripId: string, userId: string, input: CreateChecklistItemInput) {
    const member = await resolveMember(tripId, userId);
    return checklistRepository.create(member.id, input);
  },

  async updateItem(tripId: string, userId: string, itemId: string, input: UpdateChecklistItemInput) {
    const member = await resolveMember(tripId, userId);
    const item = await checklistRepository.findById(itemId, member.id);
    if (!item) throw new AppError(404, 'Checklist item not found');
    return checklistRepository.update(itemId, input);
  },

  async deleteItem(tripId: string, userId: string, itemId: string) {
    const member = await resolveMember(tripId, userId);
    const item = await checklistRepository.findById(itemId, member.id);
    if (!item) throw new AppError(404, 'Checklist item not found');
    return checklistRepository.delete(itemId);
  },

  // ── Visibility ──────────────────────────────────────────────────────────────

  async setVisibility(tripId: string, userId: string, isPublic: boolean) {
    const member = await resolveMember(tripId, userId);
    if (member.role !== 'OWNER') throw new AppError(403, 'Only the trip owner can change checklist visibility');
    return checklistRepository.setVisibility(member.id, isPublic);
  },

  async getOwnerItems(tripId: string, userId: string) {
    await resolveMember(tripId, userId);
    const owner = await checklistRepository.findOwnerMember(tripId);
    if (!owner) throw new AppError(404, 'Trip owner not found');
    const ownerName = owner.user?.name ?? 'Owner';
    if (!owner.checklistIsPublic) return { isPublic: false, ownerName, categories: [], uncategorized: [] };
    const checklist = await getFullChecklist(owner.id);
    return { isPublic: true, ownerName, ...checklist };
  },
};
