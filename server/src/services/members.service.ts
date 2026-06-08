import { prisma } from '../config/database';
import type { AddMemberInput } from '../validators/members.validators';

export class MembersService {
  async getMembers(tripId: string) {
    return prisma.tripMember.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMember(tripId: string, input: AddMemberInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

    if (existingUser) {
      const alreadyMember = await prisma.tripMember.findFirst({
        where: { tripId, userId: existingUser.id },
      });
      if (alreadyMember) throw new Error('ALREADY_MEMBER');

      return prisma.tripMember.create({
        data: { tripId, userId: existingUser.id, role: 'MEMBER' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    }

    // Pending member — no account yet
    const pendingMember = await prisma.tripMember.findFirst({
      where: { tripId, invitedEmail: input.email },
    });
    if (pendingMember) throw new Error('ALREADY_INVITED');

    return prisma.tripMember.create({
      data: {
        tripId,
        invitedName: input.name,
        invitedEmail: input.email,
        isPending: true,
        role: 'MEMBER',
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(tripId: string, memberId: string) {
    const member = await prisma.tripMember.findFirst({ where: { id: memberId, tripId } });
    if (!member) throw new Error('NOT_FOUND');
    if (member.role === 'OWNER') throw new Error('CANNOT_REMOVE_OWNER');
    return prisma.tripMember.delete({ where: { id: memberId } });
  }
}
