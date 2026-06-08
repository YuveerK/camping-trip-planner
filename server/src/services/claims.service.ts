import { prisma } from '../config/database';
import type { CreateClaimInput, UpdateClaimInput } from '../validators/claims.validators';

export class ClaimsService {
  private async getMemberForTrip(itemId: string, userId: string) {
    const item = await prisma.packingItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('ITEM_NOT_FOUND');

    const member = await prisma.tripMember.findFirst({
      where: { tripId: item.tripId, userId },
    });
    if (!member) throw new Error('NOT_MEMBER');
    return { item, member };
  }

  async createClaim(itemId: string, userId: string, input: CreateClaimInput) {
    const { item, member } = await this.getMemberForTrip(itemId, userId);

    const existing = await prisma.itemClaim.findUnique({
      where: { packingItemId_memberId: { packingItemId: itemId, memberId: member.id } },
    });
    if (existing) throw new Error('ALREADY_CLAIMED');

    const totalClaimed = await prisma.itemClaim.aggregate({
      where: { packingItemId: itemId },
      _sum: { claimedQuantity: true },
    });
    const claimed = totalClaimed._sum.claimedQuantity ?? 0;
    const remaining = item.requiredQuantity - claimed;

    if (input.claimedQuantity > remaining && remaining > 0) {
      throw new Error(`EXCEEDS_REQUIRED:${remaining}`);
    }

    return prisma.itemClaim.create({
      data: { packingItemId: itemId, memberId: member.id, ...input },
      include: {
        member: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
  }

  async updateClaim(itemId: string, claimId: string, userId: string, input: UpdateClaimInput) {
    const claim = await prisma.itemClaim.findFirst({
      where: { id: claimId, packingItemId: itemId },
      include: { member: true },
    });
    if (!claim) throw new Error('NOT_FOUND');
    if (claim.member.userId !== userId) throw new Error('FORBIDDEN');

    return prisma.itemClaim.update({
      where: { id: claimId },
      data: input,
      include: {
        member: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
  }

  async deleteClaim(itemId: string, claimId: string, userId: string) {
    const claim = await prisma.itemClaim.findFirst({
      where: { id: claimId, packingItemId: itemId },
      include: { member: true },
    });
    if (!claim) throw new Error('NOT_FOUND');
    if (claim.member.userId !== userId) throw new Error('FORBIDDEN');
    return prisma.itemClaim.delete({ where: { id: claimId } });
  }

  async togglePacked(itemId: string, claimId: string, userId: string) {
    const claim = await prisma.itemClaim.findFirst({
      where: { id: claimId, packingItemId: itemId },
      include: { member: true },
    });
    if (!claim) throw new Error('NOT_FOUND');
    if (claim.member.userId !== userId) throw new Error('FORBIDDEN');

    return prisma.itemClaim.update({
      where: { id: claimId },
      data: { isPacked: !claim.isPacked },
      include: {
        member: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
  }
}
