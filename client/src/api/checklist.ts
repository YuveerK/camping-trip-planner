import api from './axios';
import type { ApiResponse, ChecklistItem, ChecklistCategory, ChecklistData, OwnerChecklistData } from '../types';

export type { ChecklistItem, ChecklistCategory, ChecklistData, OwnerChecklistData };

export const checklistApi = {
  // ── Full checklist (categories + uncategorized) ─────────────────────────────
  getAll: (tripId: string) =>
    api.get<ApiResponse<ChecklistData>>(`/trips/${tripId}/checklist`).then((r) => r.data),

  getOwnerItems: (tripId: string) =>
    api.get<ApiResponse<OwnerChecklistData>>(`/trips/${tripId}/checklist/owner`).then((r) => r.data),

  // ── Categories ──────────────────────────────────────────────────────────────
  createCategory: (tripId: string, name: string) =>
    api
      .post<ApiResponse<ChecklistCategory>>(`/trips/${tripId}/checklist/categories`, { name })
      .then((r) => r.data),

  updateCategory: (tripId: string, categoryId: string, name: string) =>
    api
      .patch<ApiResponse<ChecklistCategory>>(`/trips/${tripId}/checklist/categories/${categoryId}`, { name })
      .then((r) => r.data),

  deleteCategory: (tripId: string, categoryId: string) =>
    api.delete(`/trips/${tripId}/checklist/categories/${categoryId}`),

  // ── Items ───────────────────────────────────────────────────────────────────
  create: (tripId: string, text: string, categoryId?: string | null) =>
    api
      .post<ApiResponse<ChecklistItem>>(`/trips/${tripId}/checklist`, { text, categoryId })
      .then((r) => r.data),

  update: (tripId: string, itemId: string, data: Partial<Pick<ChecklistItem, 'text' | 'isChecked' | 'categoryId'>>) =>
    api
      .patch<ApiResponse<ChecklistItem>>(`/trips/${tripId}/checklist/${itemId}`, data)
      .then((r) => r.data),

  delete: (tripId: string, itemId: string) => api.delete(`/trips/${tripId}/checklist/${itemId}`),

  // ── Import from packing ─────────────────────────────────────────────────────
  importPackingCategory: (tripId: string, packingCategoryId: string) =>
    api
      .post<ApiResponse<ChecklistCategory>>(`/trips/${tripId}/checklist/categories/import-packing/${packingCategoryId}`)
      .then((r) => r.data),

  // ── Visibility ──────────────────────────────────────────────────────────────
  setVisibility: (tripId: string, isPublic: boolean) =>
    api
      .patch<ApiResponse<{ checklistIsPublic: boolean }>>(`/trips/${tripId}/checklist/visibility`, { isPublic })
      .then((r) => r.data),
};
