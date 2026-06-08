import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { tripsService } from './trips.service';

export const getTrips = catchAsync(async (req: Request, res: Response) => {
  const trips = await tripsService.getTrips(req.user!.userId);
  res.json({ status: 'success', data: trips });
});

export const getTrip = catchAsync(async (req: Request, res: Response) => {
  const trip = await tripsService.getTrip(req.params['tripId']!);
  res.json({ status: 'success', data: trip });
});

export const createTrip = catchAsync(async (req: Request, res: Response) => {
  const trip = await tripsService.createTrip(req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: trip });
});

export const updateTrip = catchAsync(async (req: Request, res: Response) => {
  const trip = await tripsService.updateTrip(req.params['tripId']!, req.body);
  res.json({ status: 'success', data: trip });
});

export const deleteTrip = catchAsync(async (req: Request, res: Response) => {
  await tripsService.deleteTrip(req.params['tripId']!);
  res.status(204).send();
});
