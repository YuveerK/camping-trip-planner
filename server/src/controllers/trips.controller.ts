import { Response } from 'express';
import { TripsService } from '../services/trips.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const tripsService = new TripsService();

export async function getTrips(req: AuthRequest, res: Response) {
  try {
    const trips = await tripsService.getTrips(req.user!.userId);
    return R.ok(res, trips);
  } catch {
    return R.serverError(res);
  }
}

export async function getTrip(req: AuthRequest, res: Response) {
  try {
    const trip = await tripsService.getTrip(req.params['tripId']!);
    if (!trip) return R.notFoundResponse(res, 'Trip not found');
    return R.ok(res, trip);
  } catch {
    return R.serverError(res);
  }
}

export async function createTrip(req: AuthRequest, res: Response) {
  try {
    const trip = await tripsService.createTrip(req.user!.userId, req.body);
    return R.created(res, trip, 'Trip created successfully');
  } catch {
    return R.serverError(res);
  }
}

export async function updateTrip(req: AuthRequest, res: Response) {
  try {
    const trip = await tripsService.updateTrip(req.params['tripId']!, req.body);
    return R.ok(res, trip, 'Trip updated');
  } catch {
    return R.serverError(res);
  }
}

export async function deleteTrip(req: AuthRequest, res: Response) {
  try {
    await tripsService.deleteTrip(req.params['tripId']!);
    return R.noContent(res);
  } catch {
    return R.serverError(res);
  }
}
