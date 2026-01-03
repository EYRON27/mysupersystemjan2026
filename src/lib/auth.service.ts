import { api, ApiResponse, tokenManager } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Auth service functions
export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    const { user, accessToken, refreshToken } = response.data.data;
    tokenManager.setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;
    tokenManager.setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenManager.clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async refreshToken(): Promise<string> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    const { accessToken } = response.data.data;
    localStorage.setItem('access_token', accessToken);
    return accessToken;
  },

  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  },
};
