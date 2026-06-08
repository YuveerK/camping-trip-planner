import api from './axios';
import type { ApiResponse, PackingItem, PackingCategory } from '../types';

export interface CreatePackingItemPayload {
  name: string;
  description?: string;
  categoryId?: string | null;
  requiredQuantity?: number;
  unit?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  isSharedItem?: boolean;
}

export const packingApi = {
  getCategories: (tripId: string) =>
    api.get<ApiResponse<PackingCategory[]>>(`/trips/${tripId}/packing-items/categories`).then((r) => r.data),
  createCategory: (tripId: string, data: { name: string }) =>
    api.post<ApiResponse<PackingCategory>>(`/trips/${tripId}/packing-items/categories`, data).then((r) => r.data),
  getAll: (tripId: string) =>
    api.get<ApiResponse<PackingItem[]>>(`/trips/${tripId}/packing-items`).then((r) => r.data),
  getMissing: (tripId: string) =>
    api.get<ApiResponse<PackingItem[]>>(`/trips/${tripId}/packing-items/missing`).then((r) => r.data),
  create: (tripId: string, data: CreatePackingItemPayload) =>
    api.post<ApiResponse<PackingItem>>(`/trips/${tripId}/packing-items`, data).then((r) => r.data),
  update: (tripId: string, itemId: string, data: Partial<CreatePackingItemPayload>) =>
    api.patch<ApiResponse<PackingItem>>(`/trips/${tripId}/packing-items/${itemId}`, data).then((r) => r.data),
  delete: (tripId: string, itemId: string) =>
    api.delete(`/trips/${tripId}/packing-items/${itemId}`),
};
