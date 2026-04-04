// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Analyst' | 'Viewer';
export type UserStatus = 'active' | 'inactive';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// ─── Financial Record Types ───────────────────────────────────────────────────
export type RecordType = 'income' | 'expense';

export const VALID_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rental', 'Business',
  'Food', 'Transport', 'Healthcare', 'Education', 'Entertainment',
  'Utilities', 'Shopping', 'Travel', 'Insurance', 'Tax', 'Other',
] as const;

export type Category = typeof VALID_CATEGORIES[number];

export interface FinancialRecord {
  _id: string;
  amount: number;
  type: RecordType;
  category: Category;
  date: string;
  notes?: string;
  createdBy: Pick<User, '_id' | 'name' | 'email'>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateRecordPayload {
  amount: number;
  type: RecordType;
  category: Category;
  date: string;
  notes?: string;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────
export interface DashboardSummary {
  income: number;
  incomeCount: number;
  expense: number;
  expenseCount: number;
  netBalance: number;
  totalTransactions: number;
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  [category: string]: {
    income: number;
    expense: number;
    incomeCount: number;
    expenseCount: number;
  };
}

export interface DashboardData {
  summary: DashboardSummary;
  categoryBreakdown?: CategoryBreakdown;
  monthlyTrend?: MonthlyTrendPoint[];
  recentTransactions: FinancialRecord[];
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Filter Types ─────────────────────────────────────────────────────────────
export interface RecordFilters {
  type?: RecordType | '';
  category?: Category | '';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: UserRole | '';
  status?: UserStatus | '';
  search?: string;
  page?: number;
  limit?: number;
}
