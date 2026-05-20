export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  paymentLink: string;
  collaboratorCount?: number;
  totalRevenue?: string;
  totalPayments?: number;
  createdAt: string;
  updatedAt: string;
  collaborators?: Collaborator[];
  stats?: ProjectStats;
}

export interface ProjectStats {
  totalPayments: number;
  totalRevenue: string;
  averagePayment: string;
  lastPayment?: string | null;
}

export interface Collaborator {
  id: string;
  projectId: string;
  email: string;
  name: string;
  percentage: number;
  pixKey?: string | null;
  totalEarned?: string;
  lastTransfer?: string | null;
  createdAt?: string;
}

export interface Payment {
  id: string;
  projectId: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripeId: string;
  createdAt: string;
  splits?: SplitSummary[];
}

export interface SplitSummary {
  collaboratorName: string;
  amount: string;
  status: string;
}

export interface Transfer {
  id: string;
  splitId: string;
  projectName: string;
  collaboratorName: string;
  amount: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripeTransferId?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface DashboardEarnings {
  asOwner: {
    totalRevenue: string;
    totalProjects: number;
    totalPayments: number;
  };
  asCollaborator: {
    totalEarned: string;
    collaboratingIn: number;
    totalTransfers: number;
  };
}

export interface DashboardTransfer {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  collaboratorEmail: string;
  pixKey: string | null;
  amount: string;
  projectId: string;
  projectName: string;
  status: string;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface DashboardTransfers {
  transfers: DashboardTransfer[];
  summary: {
    pending: string;
    sent: string;
    completed: string;
    failed: string;
  };
}

export interface RevenueChartPoint {
  month: string;
  total: number;
}

export interface CreatePaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  stripePublishableKey: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
}
