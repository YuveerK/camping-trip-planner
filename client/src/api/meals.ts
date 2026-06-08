import api from './axios';
import type { ApiResponse, Meal } from '../types';

export interface CreateMealPayload {
  title: string;
  description?: string;
  mealDate: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  assignedToMemberId?: string | null;
}

export const mealsApi = {
  getAll: (tripId: string) =>
    api.get<ApiResponse<Meal[]>>(`/trips/${tripId}/meals`).then((r) => r.data),
  create: (tripId: string, data: CreateMealPayload) =>
    api.post<ApiResponse<Meal>>(`/trips/${tripId}/meals`, data).then((r) => r.data),
  update: (tripId: string, mealId: string, data: Partial<CreateMealPayload>) =>
    api.patch<ApiResponse<Meal>>(`/trips/${tripId}/meals/${mealId}`, data).then((r) => r.data),
  delete: (tripId: string, mealId: string) =>
    api.delete(`/trips/${tripId}/meals/${mealId}`),
};
