import { membersRepository } from './members.repository';
import { prisma } from '../../db/client';
import { AppError } from '../../utils/AppError';
import type { AddMemberInput } from './members.schema';

export const membersService = {
  getMembers: (tripId: string) => membersRepository.findAll(tripId),

  async addMember(tripId: string, input: AddMemberInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

    if (existingUser) {
      const alreadyMember = await membersRepository.findByUserId(tripId, existingUser.id);
      if (alreadyMember) throw new AppError(409, 'This user is already a member of this trip');
      return membersRepository.createActive(tripId, existingUser.id);
    }

    const pendingMember = await membersRepository.findByInviteEmail(tripId, input.email);
    if (pendingMember) throw new AppError(409, 'This email has already been invited');

    return membersRepository.createPending(tripId, input.name, input.email);
  },

  async removeMember(tripId: string, memberId: string) {
    const member = await membersRepository.findById(memberId, tripId);
    if (!member) throw new AppError(404, 'Member not found');
    if (member.role === 'OWNER') throw new AppError(403, 'Cannot remove the trip owner');
    return membersRepository.delete(memberId);
  },
};
