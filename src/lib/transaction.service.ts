import { api, ApiResponse } from './api';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryId: string;
  description: string;
  date: string;
  createdAt?: string;
}

export interface TransactionSummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
  period: string;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface TransactionFormData {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  categoryId?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

// Transaction service functions
export const transactionService = {
  async getAll(filters: TransactionFilters = {}): Promise<{
    transactions: Transaction[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.period) params.append('period', filters.period);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data.data;
  },

  async getSummary(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<TransactionSummary> {
    const response = await api.get<ApiResponse<TransactionSummary>>(`/transactions/summary?period=${period}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data;
  },

  async create(data: TransactionFormData): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data.data;
  },

  async update(id: string, data: TransactionFormData): Promise<Transaction> {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/categories/transactions');
    return response.data.data;
  },

  async createCategory(name: string): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>('/categories', {
      name,
      type: 'transaction',
    });
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/transactions/${id}`);
  },
};
