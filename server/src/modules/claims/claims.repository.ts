import { prisma } from '../../db/client';
import type { CreateClaimInput, UpdateClaimInput } from './claims.schema';

const CLAIM_INCLUDE = {
  member: { include: { user: { select: { id: true, name: true, email: true } } } },
};

export const claimsRepository = {
  findItemById: (itemId: string) =>
    prisma.packingItem.findUnique({ where: { id: itemId } }),

  findMemberForTrip: (tripId: string, userId: string) =>
    prisma.tripMember.findFirst({ where: { tripId, userId } }),

  findExistingClaim: (packingItemId: string, memberId: string) =>
    prisma.itemClaim.findUnique({
      where: { packingItemId_memberId: { packingItemId, memberId } },
    }),

  sumClaimedQuantity: (packingItemId: string) =>
    prisma.itemClaim.aggregate({
      where: { packingItemId },
      _sum: { claimedQuantity: true },
    }),

  findClaimById: (claimId: string, packingItemId: string) =>
    prisma.itemClaim.findFirst({
      where: { id: claimId, packingItemId },
      include: { member: true },
    }),

  create: (packingItemId: string, memberId: string, input: CreateClaimInput) =>
    prisma.itemClaim.create({
      data: { packingItemId, memberId, ...input },
      include: CLAIM_INCLUDE,
    }),

  update: (claimId: string, input: UpdateClaimInput) =>
    prisma.itemClaim.update({
      where: { id: claimId },
      data: input,
      include: CLAIM_INCLUDE,
    }),

  togglePacked: (claimId: string, current: boolean) =>
    prisma.itemClaim.update({
      where: { id: claimId },
      data: { isPacked: !current },
      include: CLAIM_INCLUDE,
    }),

  delete: (claimId: string) =>
    prisma.itemClaim.delete({ where: { id: claimId } }),
};
