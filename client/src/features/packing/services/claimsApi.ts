import api from '../../../config/api';
import type { ApiResponse, ItemClaim } from '../../../types';

export const claimsApi = {
  create: (itemId: string, data: { claimedQuantity: number; notes?: string }) =>
    api.post<ApiResponse<ItemClaim>>(`/packing-items/${itemId}/claims`, data).then((r) => r.data),
  update: (itemId: string, claimId: string, data: { claimedQuantity?: number; notes?: string; isPacked?: boolean }) =>
    api.patch<ApiResponse<ItemClaim>>(`/packing-items/${itemId}/claims/${claimId}`, data).then((r) => r.data),
  delete: (itemId: string, claimId: string) =>
    api.delete(`/packing-items/${itemId}/claims/${claimId}`),
  togglePacked: (itemId: string, claimId: string) =>
    api.patch<ApiResponse<ItemClaim>>(`/packing-items/${itemId}/claims/${claimId}/packed`).then((r) => r.data),
};
