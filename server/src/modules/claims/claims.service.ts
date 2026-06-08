import { claimsRepository } from './claims.repository';
import { AppError } from '../../utils/AppError';
import type { CreateClaimInput, UpdateClaimInput } from './claims.schema';

export const claimsService = {
  async createClaim(itemId: string, userId: string, input: CreateClaimInput) {
    const item = await claimsRepository.findItemById(itemId);
    if (!item) throw new AppError(404, 'Item not found');

    const member = await claimsRepository.findMemberForTrip(item.tripId, userId);
    if (!member) throw new AppError(403, 'You are not a member of this trip');

    const existing = await claimsRepository.findExistingClaim(itemId, member.id);
    if (existing) throw new AppError(409, 'You have already claimed this item');

    const agg = await claimsRepository.sumClaimedQuantity(itemId);
    const claimed = agg._sum.claimedQuantity ?? 0;
    const remaining = item.requiredQuantity - claimed;
    if (input.claimedQuantity > remaining && remaining > 0) {
      throw new AppError(400, `Only ${remaining} more needed. Reduce your claimed quantity.`);
    }

    return claimsRepository.create(itemId, member.id, input);
  },

  async updateClaim(itemId: string, claimId: string, userId: string, input: UpdateClaimInput) {
    const claim = await claimsRepository.findClaimById(claimId, itemId);
    if (!claim) throw new AppError(404, 'Claim not found');
    if (claim.member.userId !== userId) throw new AppError(403, 'You can only update your own claims');
    return claimsRepository.update(claimId, input);
  },

  async deleteClaim(itemId: string, claimId: string, userId: string) {
    const claim = await claimsRepository.findClaimById(claimId, itemId);
    if (!claim) throw new AppError(404, 'Claim not found');
    if (claim.member.userId !== userId) throw new AppError(403, 'You can only delete your own claims');
    return claimsRepository.delete(claimId);
  },

  async togglePacked(itemId: string, claimId: string, userId: string) {
    const claim = await claimsRepository.findClaimById(claimId, itemId);
    if (!claim) throw new AppError(404, 'Claim not found');
    if (claim.member.userId !== userId) throw new AppError(403, 'You can only update your own claims');
    return claimsRepository.togglePacked(claimId, claim.isPacked);
  },
};
