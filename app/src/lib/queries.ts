import { api } from './api';
import type {
  Project,
  Collaborator,
  Payment,
  DashboardEarnings,
  DashboardTransfers,
  RevenueChartPoint,
  CreatePaymentResponse,
} from '@/types';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authQueries = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }).then((r) => r.data),
};

// ─── Projects ────────────────────────────────────────────────────────────────
export const projectQueries = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<{ projects: Project[]; total: number; limit: number; offset: number }>('/projects', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (data: { name: string; description?: string }) =>
    api.post<Project>('/projects', data).then((r) => r.data),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/projects/${id}`),
};

// ─── Collaborators ───────────────────────────────────────────────────────────
export const collabQueries = {
  list: (projectId: string) =>
    api.get<{ collaborators: Collaborator[]; totalPercentage: number }>(
      `/projects/${projectId}/collaborators`,
    ).then((r) => r.data),

  add: (projectId: string, data: { email: string; name: string; percentage: number; pixKey?: string }) =>
    api.post<Collaborator>(`/projects/${projectId}/collaborators`, data).then((r) => r.data),

  update: (projectId: string, collabId: string, data: { percentage?: number; pixKey?: string }) =>
    api.put<Collaborator>(`/projects/${projectId}/collaborators/${collabId}`, data).then((r) => r.data),

  remove: (projectId: string, collabId: string) =>
    api.delete(`/projects/${projectId}/collaborators/${collabId}`),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentQueries = {
  list: (params?: { projectId?: string; status?: string; limit?: number; offset?: number }) =>
    api.get<{ payments: Payment[]; total: number }>('/payments', { params }).then((r) => r.data),

  createIntent: (
    projectId: string,
    data: { amount: number; customerEmail?: string; customerName?: string },
  ) =>
    api.post<CreatePaymentResponse>(`/projects/${projectId}/create-payment`, data).then((r) => r.data),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardQueries = {
  earnings: () =>
    api.get<DashboardEarnings>('/dashboard/earnings').then((r) => r.data),

  transfers: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get<DashboardTransfers>('/dashboard/pending-transfers', { params }).then((r) => r.data),

  revenueChart: () =>
    api.get<RevenueChartPoint[]>('/dashboard/revenue-chart').then((r) => r.data),
};
