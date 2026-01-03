import { api, ApiResponse } from './api';

export interface PasswordEntry {
  id: string;
  website: string;
  username: string;
  password: string; // Masked when fetched, revealed only on demand
  category: string;
  categoryId: string;
  notes?: string;
  createdAt: string;
}

export interface PasswordCategory {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface PasswordFormData {
  website: string;
  username: string;
  password: string;
  categoryId: string;
  notes?: string;
}

export interface PasswordFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

// Password vault service functions
export const vaultService = {
  async getAll(filters: PasswordFilters = {}): Promise<{
    passwords: PasswordEntry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/vault?${params.toString()}`);
    return response.data.data;
  },

  async getById(id: string): Promise<PasswordEntry> {
    const response = await api.get<ApiResponse<PasswordEntry>>(`/vault/${id}`);
    return response.data.data;
  },

  async revealPassword(id: string, userPassword: string): Promise<string> {
    const response = await api.post<ApiResponse<{ password: string }>>(`/vault/${id}/reveal`, {
      password: userPassword,
    });
    return response.data.data.password;
  },

  async create(data: PasswordFormData): Promise<PasswordEntry> {
    const response = await api.post<ApiResponse<PasswordEntry>>('/vault', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<PasswordFormData>): Promise<PasswordEntry> {
    const response = await api.put<ApiResponse<PasswordEntry>>(`/vault/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vault/${id}`);
  },

  // Categories
  async getCategories(): Promise<PasswordCategory[]> {
    const response = await api.get<ApiResponse<PasswordCategory[]>>('/categories/passwords');
    return response.data.data;
  },

  async createCategory(name: string): Promise<PasswordCategory> {
    const response = await api.post<ApiResponse<PasswordCategory>>('/categories', {
      name,
      type: 'password',
    });
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/passwords/${id}`);
  },
};
