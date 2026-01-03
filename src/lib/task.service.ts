import { api, ApiResponse } from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'ongoing' | 'completed';
  deadline: string;
  createdAt: string;
  isOverdue?: boolean;
}

export interface TaskSummary {
  pending: number;
  ongoing: number;
  completed: number;
  overdue: number;
  total: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status?: 'todo' | 'ongoing' | 'completed';
  deadline: string;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: 'all' | 'todo' | 'ongoing' | 'completed';
  sortBy?: 'deadline' | 'createdAt' | 'title';
}

// Task service functions
export const taskService = {
  async getAll(filters: TaskFilters = {}): Promise<{
    tasks: Task[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.data;
  },

  async getSummary(): Promise<TaskSummary> {
    const response = await api.get<ApiResponse<TaskSummary>>('/tasks/summary');
    return response.data.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  async create(data: TaskFormData): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: 'todo' | 'ongoing' | 'completed'): Promise<{ id: string; status: string }> {
    const response = await api.patch<ApiResponse<{ id: string; status: string }>>(`/tasks/${id}/status`, { status });
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
