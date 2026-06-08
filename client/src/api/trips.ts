import api from './axios';
import type { ApiResponse, Trip } from '../types';

export interface CreateTripPayload {
  name: string;
  campsiteName?: string;
  location?: string;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  description?: string;
  bookingReference?: string;
}

export const tripsApi = {
  getAll: () =>
    api.get<ApiResponse<Trip[]>>('/trips').then((r) => r.data),
  getOne: (tripId: string) =>
    api.get<ApiResponse<Trip>>(`/trips/${tripId}`).then((r) => r.data),
  create: (data: CreateTripPayload) =>
    api.post<ApiResponse<Trip>>('/trips', data).then((r) => r.data),
  update: (tripId: string, data: Partial<CreateTripPayload>) =>
    api.patch<ApiResponse<Trip>>(`/trips/${tripId}`, data).then((r) => r.data),
  delete: (tripId: string) =>
    api.delete(`/trips/${tripId}`),
};
