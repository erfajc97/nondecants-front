import { useAuthStore } from '@/app/store/auth/authStore';
import { secureStorage } from '@/app/helpers/secureStorage';
import type { AuthResponse } from '../types';

export const applyAuthSuccess = (data: AuthResponse, keepSession: boolean) => {
  const decoded = JSON.parse(atob(data.access_token.split('.')[1]));
  const expiration = decoded.exp * 1000;

  useAuthStore.getState().setToken(data.access_token, data.refresh_token, expiration);
  useAuthStore.getState().setUser(data.user);
  secureStorage.setItem('keepSession', String(keepSession));
};
