import { prisma } from '../../db/client';

const MEMBER_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
};

export const membersRepository = {
  findAll: (tripId: string) =>
    prisma.tripMember.findMany({
      where: { tripId },
      include: MEMBER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    }),

  findByUserId: (tripId: string, userId: string) =>
    prisma.tripMember.findFirst({ where: { tripId, userId } }),

  findByInviteEmail: (tripId: string, email: string) =>
    prisma.tripMember.findFirst({ where: { tripId, invitedEmail: email } }),

  findById: (id: string, tripId: string) =>
    prisma.tripMember.findFirst({ where: { id, tripId } }),

  createActive: (tripId: string, userId: string) =>
    prisma.tripMember.create({
      data: { tripId, userId, role: 'MEMBER' },
      include: MEMBER_INCLUDE,
    }),

  createPending: (tripId: string, name: string, email: string) =>
    prisma.tripMember.create({
      data: { tripId, invitedName: name, invitedEmail: email, isPending: true, role: 'MEMBER' },
      include: MEMBER_INCLUDE,
    }),

  delete: (id: string) =>
    prisma.tripMember.delete({ where: { id } }),
};
