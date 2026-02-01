import { api, ApiResponse } from './api';

// Export types used in components
export interface VaultEntry {
  id: string;
  website: string;
  username: string;
  password: string; // Masked when fetched, revealed only on demand
  category: string;
  categoryId: string;
  notes?: string;
  createdAt: string;
}

export interface VaultCategory {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface VaultFormData {
  website: string;
  username: string;
  password: string;
  categoryId?: string;
  notes?: string;
}

// Keep backward compatibility with old names
export type PasswordEntry = VaultEntry;
export type PasswordCategory = VaultCategory;
export type PasswordFormData = VaultFormData;

export interface PasswordFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

// Password vault service functions
export const vaultService = {
  async getAll(filters: PasswordFilters = {}): Promise<{
    entries: VaultEntry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/vault?${params.toString()}`);
    // Map backend response (passwords) to frontend naming (entries)
    return {
      entries: response.data.data.passwords,
      pagination: response.data.data.pagination,
    };
  },

  async getById(id: string): Promise<VaultEntry> {
    const response = await api.get<ApiResponse<VaultEntry>>(`/vault/${id}`);
    return response.data.data;
  },

  async reveal(id: string, userPassword: string): Promise<{ password: string }> {
    const response = await api.post<ApiResponse<{ password: string }>>(`/vault/${id}/reveal`, {
      password: userPassword,
    });
    return response.data.data;
  },

  // Alias for backward compatibility
  async revealPassword(id: string, userPassword: string): Promise<string> {
    const result = await this.reveal(id, userPassword);
    return result.password;
  },

  async create(data: VaultFormData): Promise<VaultEntry> {
    const response = await api.post<ApiResponse<VaultEntry>>('/vault', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<VaultFormData>): Promise<VaultEntry> {
    const response = await api.put<ApiResponse<VaultEntry>>(`/vault/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vault/${id}`);
  },

  // Categories
  async getCategories(): Promise<VaultCategory[]> {
    const response = await api.get<ApiResponse<VaultCategory[]>>('/categories/passwords');
    return response.data.data;
  },

  async createCategory(name: string): Promise<VaultCategory> {
    const response = await api.post<ApiResponse<VaultCategory>>('/categories', {
      name,
      type: 'password',
    });
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/passwords/${id}`);
  },
};
