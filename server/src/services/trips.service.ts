import { prisma } from '../config/database';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import type { CreateTripInput, UpdateTripInput } from '../validators/trips.validators';

const TRIP_INCLUDE = {
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: {
    select: {
      packingItems: true,
      tasks: true,
      meals: true,
      expenses: true,
    },
  },
};

export class TripsService {
  async getTrips(userId: string) {
    return prisma.trip.findMany({
      where: {
        members: { some: { userId, isPending: false } },
      },
      include: TRIP_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrip(tripId: string) {
    return prisma.trip.findUnique({ where: { id: tripId }, include: TRIP_INCLUDE });
  }

  async createTrip(userId: string, input: CreateTripInput) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          ...input,
          checkInDate: input.checkInDate ? new Date(input.checkInDate) : null,
          checkOutDate: input.checkOutDate ? new Date(input.checkOutDate) : null,
          createdById: userId,
          members: {
            create: { userId, role: 'OWNER' },
          },
        },
        include: TRIP_INCLUDE,
      });

      await tx.packingCategory.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({ ...c, tripId: trip.id })),
      });

      return trip;
    });
  }

  async updateTrip(tripId: string, input: UpdateTripInput) {
    return prisma.trip.update({
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
    });
  }

  async deleteTrip(tripId: string) {
    return prisma.trip.delete({ where: { id: tripId } });
  }
}
