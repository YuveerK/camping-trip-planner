import api from './axios';
import type { ApiResponse, TripMember } from '../types';

export const membersApi = {
  getAll: (tripId: string) =>
    api.get<ApiResponse<TripMember[]>>(`/trips/${tripId}/members`).then((r) => r.data),
  add: (tripId: string, data: { name: string; email: string }) =>
    api.post<ApiResponse<TripMember>>(`/trips/${tripId}/members`, data).then((r) => r.data),
  remove: (tripId: string, memberId: string) =>
    api.delete(`/trips/${tripId}/members/${memberId}`),
};
