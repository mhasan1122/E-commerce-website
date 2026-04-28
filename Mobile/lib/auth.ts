import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
}

export const authApi = {
  login: async (credentials: AuthCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/register', userData);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await api.put('/auth/me/profile', updates);
    return data.user;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/users/me/password', passwords);
  },
};