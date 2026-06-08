import { prisma } from '../../db/client';

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data: { name: string; email: string; passwordHash: string }) =>
    prisma.user.create({
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
};
