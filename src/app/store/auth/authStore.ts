import { create } from 'zustand';
import { secureStorage } from '@/app/helpers/secureStorage';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  tokenExpiration: number | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  setToken: (token: string, refreshToken: string, expiration: number) => void;
  setUser: (user: AuthUser) => void;
  removeToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:           secureStorage.getItem('token'),
  refreshToken:    secureStorage.getItem('refreshToken'),
  tokenExpiration: Number(secureStorage.getItem('tokenExpiration')) || null,
  user:            null,
  isAuthenticated: !!secureStorage.getItem('token'),

  setToken: (token, refreshToken, expiration) => {
    secureStorage.setItem('token', token);
    secureStorage.setItem('refreshToken', refreshToken);
    secureStorage.setItem('tokenExpiration', String(expiration));
    set({ token, refreshToken, tokenExpiration: expiration, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  removeToken: () => {
    secureStorage.removeItem('token');
    secureStorage.removeItem('refreshToken');
    secureStorage.removeItem('tokenExpiration');
    secureStorage.removeItem('keepSession');
    set({ token: null, refreshToken: null, tokenExpiration: null, user: null, isAuthenticated: false });
  },
}));
