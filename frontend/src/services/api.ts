/**
 * Axios API Service Layer
 * Centralized Axios instance with JWT interceptor and global error handling.
 * All API calls go through this service for consistent error handling.
 */
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import type {
  User, FinancialRecord, DashboardData,
  ApiResponse, PaginatedResponse,
  CreateRecordPayload, RecordFilters, UserFilters
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request Interceptor: Attach JWT from localStorage ───────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('fd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Global error handling ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';

    // Auto-redirect to login on 401 (token expired / invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('fd_token');
      localStorage.removeItem('fd_user');
      window.location.href = '/login';
    }

    // Show toast for all errors except 401 (handled via redirect)
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<User> & { token: string; user: User }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/login', data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};

// ─── User Management API (Admin only) ────────────────────────────────────────
export const userAPI = {
  getAll: (filters?: UserFilters) =>
    api.get<PaginatedResponse<User>>('/users', { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<ApiResponse<User>>('/users', data),

  update: (id: string, data: Partial<Pick<User, 'name' | 'role' | 'status'>>) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),

  deactivate: (id: string) =>
    api.delete<ApiResponse<User>>(`/users/${id}`),
};

// ─── Financial Records API ────────────────────────────────────────────────────
export const recordAPI = {
  getAll: (filters?: RecordFilters) =>
    api.get<PaginatedResponse<FinancialRecord>>('/records', { params: filters }),

  getDeleted: (page: number = 1) =>
    api.get<PaginatedResponse<FinancialRecord>>('/records/trash', { params: { page } }),

  getById: (id: string) =>
    api.get<ApiResponse<FinancialRecord>>(`/records/${id}`),

  create: (data: CreateRecordPayload) =>
    api.post<ApiResponse<FinancialRecord>>('/records', data),

  update: (id: string, data: Partial<CreateRecordPayload> & { __v?: number }) =>
    api.patch<ApiResponse<FinancialRecord>>(`/records/${id}`, data),

  restore: (id: string) =>
    api.patch<ApiResponse<FinancialRecord>>(`/records/${id}/restore`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/records/${id}`),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () =>
    api.get<ApiResponse<DashboardData>>('/dashboard'),
};

export default api;
