import api from './axios';
import type { ApiResponse, Task } from '../types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignedToMemberId?: string | null;
  dueDate?: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export const tasksApi = {
  getAll: (tripId: string) =>
    api.get<ApiResponse<Task[]>>(`/trips/${tripId}/tasks`).then((r) => r.data),
  create: (tripId: string, data: CreateTaskPayload) =>
    api.post<ApiResponse<Task>>(`/trips/${tripId}/tasks`, data).then((r) => r.data),
  update: (tripId: string, taskId: string, data: Partial<CreateTaskPayload>) =>
    api.patch<ApiResponse<Task>>(`/trips/${tripId}/tasks/${taskId}`, data).then((r) => r.data),
  delete: (tripId: string, taskId: string) =>
    api.delete(`/trips/${tripId}/tasks/${taskId}`),
};
