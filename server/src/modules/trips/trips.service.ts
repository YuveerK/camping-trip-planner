import { tripsRepository } from './trips.repository';
import { AppError } from '../../utils/AppError';
import type { CreateTripInput, UpdateTripInput } from './trips.schema';

export const tripsService = {
  getTrips: (userId: string) => tripsRepository.findMany(userId),

  async getTrip(tripId: string) {
    const trip = await tripsRepository.findById(tripId);
    if (!trip) throw new AppError(404, 'Trip not found');
    return trip;
  },

  createTrip: (userId: string, input: CreateTripInput) =>
    tripsRepository.create(userId, input),

  updateTrip: (tripId: string, input: UpdateTripInput) =>
    tripsRepository.update(tripId, input),

  deleteTrip: (tripId: string) =>
    tripsRepository.delete(tripId),
};
