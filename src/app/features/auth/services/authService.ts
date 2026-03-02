import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types';

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.LOGIN, payload);
    return data?.content ?? data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.REGISTER, payload);
    return data?.content ?? data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.LOGOUT);
  },
};
