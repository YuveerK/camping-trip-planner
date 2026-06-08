import { checklistRepository } from './checklist.repository';
import { AppError } from '../../utils/AppError';
import type { CreateChecklistItemInput, UpdateChecklistItemInput } from './checklist.schema';

async function resolveMember(tripId: string, userId: string) {
  const member = await checklistRepository.findMember(tripId, userId);
  if (!member) throw new AppError(403, 'You are not a member of this trip');
  return member;
}

export const checklistService = {
  async getItems(tripId: string, userId: string) {
    const member = await resolveMember(tripId, userId);
    return checklistRepository.findAll(member.id);
  },

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
};
