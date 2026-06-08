import api from '../../../config/api';
import type { ApiResponse, User } from '../../../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthData { user: User; token: string; }

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/register', data).then((r) => r.data),
  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/login', data).then((r) => r.data),
  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
};
