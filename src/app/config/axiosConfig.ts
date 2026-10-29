import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { secureStorage } from '@/app/helpers/secureStorage';
import { useAuthStore } from '@/app/store/auth/authStore';
import { DEMO_ENABLED } from '@/app/lib/mock';

// En dev, si no carga VITE_API_BASE_URL, pega al backend LOCAL (no a staging).
// En build/prod el fallback sigue siendo staging.
const FALLBACK_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4001/api'
  : 'https://stgapi.nondecants.com/api';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || FALLBACK_BASE_URL,
  // Demo: sin backend. El import dinámico deja los datos de prueba fuera del bundle normal.
  ...(DEMO_ENABLED
    ? { adapter: (cfg: any) => import('@/app/mock/mockAdapter').then((m) => m.mockAdapter(cfg)) }
    : {}),
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
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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

    // Si hay error 502, simplemente rechazar (no redirigir)
    if (error.response?.status === 502) {
      useAuthStore.getState().removeToken();
      return Promise.reject(error);
    }

    // Intentar renovar token si hay 401 y tenemos refresh token
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
        return Promise.reject(error);
      }
    }

    // Si hay 401 sin refresh token válido, solo remover token (no redirigir)
    if (error.response?.status === 401) {
      useAuthStore.getState().removeToken();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
