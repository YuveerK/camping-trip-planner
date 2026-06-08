import { prisma } from '../../db/client';
import { DEFAULT_CATEGORIES } from '../../utils/categories';
import type { CreateTripInput, UpdateTripInput } from './trips.schema';

const TRIP_INCLUDE = {
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: {
    select: { packingItems: true, tasks: true, meals: true, expenses: true },
  },
};

export const tripsRepository = {
  findMany: (userId: string) =>
    prisma.trip.findMany({
      where: { members: { some: { userId, isPending: false } } },
      include: TRIP_INCLUDE,
      orderBy: { createdAt: 'desc' },
    }),

  findById: (tripId: string) =>
    prisma.trip.findUnique({ where: { id: tripId }, include: TRIP_INCLUDE }),

  create: (userId: string, input: CreateTripInput) =>
    prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          ...input,
          checkInDate: input.checkInDate ? new Date(input.checkInDate) : null,
          checkOutDate: input.checkOutDate ? new Date(input.checkOutDate) : null,
          createdById: userId,
          members: { create: { userId, role: 'OWNER' } },
        },
        include: TRIP_INCLUDE,
      });
      await tx.packingCategory.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({ ...c, tripId: trip.id })),
      });
      return trip;
    }),

  update: (tripId: string, input: UpdateTripInput) =>
    prisma.trip.update({
      where: { id: tripId },
      data: {
        ...input,
        checkInDate: input.checkInDate !== undefined
          ? (input.checkInDate ? new Date(input.checkInDate) : null)
          : undefined,
        checkOutDate: input.checkOutDate !== undefined
          ? (input.checkOutDate ? new Date(input.checkOutDate) : null)
          : undefined,
      },
      include: TRIP_INCLUDE,
    }),

  delete: (tripId: string) =>
    prisma.trip.delete({ where: { id: tripId } }),
};
