import api from './axios';
import type { ApiResponse } from '../types';

export interface ChecklistItem {
  id: string;
  memberId: string;
  text: string;
  isChecked: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const checklistApi = {
  getAll: (tripId: string) =>
    api.get<ApiResponse<ChecklistItem[]>>(`/trips/${tripId}/checklist`).then((r) => r.data),

  create: (tripId: string, text: string) =>
    api.post<ApiResponse<ChecklistItem>>(`/trips/${tripId}/checklist`, { text }).then((r) => r.data),

  update: (tripId: string, itemId: string, data: Partial<Pick<ChecklistItem, 'text' | 'isChecked'>>) =>
    api.patch<ApiResponse<ChecklistItem>>(`/trips/${tripId}/checklist/${itemId}`, data).then((r) => r.data),

  delete: (tripId: string, itemId: string) =>
    api.delete(`/trips/${tripId}/checklist/${itemId}`),
};
