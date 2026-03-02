import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { secureStorage } from '@/app/helpers/secureStorage';
import { useAuthStore } from '@/app/store/auth/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitud: agrega el token si existe y no ha expirado
axiosInstance.interceptors.request.use((config) => {
  const token = secureStorage.getItem('token');
  const expiration = Number(secureStorage.getItem('tokenExpiration'));

  if (token && expiration) {
    if (Date.now() > expiration) {
      useAuthStore.getState().removeToken();
      return Promise.reject(new Error('Token expirado'));
    }
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  return config;
});

// Interceptor de respuesta: intenta renovar el token ante un 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = secureStorage.getItem('refreshToken');
    const keepSession = secureStorage.getItem('keepSession') === 'true';

    if (error.response?.status === 502) {
      useAuthStore.getState().removeToken();
      window.location.href = '/';
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      refreshToken &&
      keepSession &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axiosInstance.post(API_ENDPOINTS.RENEW_TOKEN, {
          refresh_token: refreshToken,
        });

        const newToken = data?.content?.access_token ?? data?.data?.access_token;
        const newRefreshToken = data?.content?.refresh_token ?? data?.data?.refresh_token;
        const decoded = JSON.parse(atob(newToken.split('.')[1]));
        const expiration = decoded.exp * 1000;

        useAuthStore.getState().setToken(newToken, newRefreshToken, expiration);

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().removeToken();
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().removeToken();
      if (window.location.pathname !== '/checkout') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
