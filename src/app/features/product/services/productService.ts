import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import type { Product } from '@/app/types/global.types';

export const productService = {
  getById: async (id: string): Promise<Product> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.PRODUCT}/${id}`);
    return data?.content ?? data;
  },

  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS, { params });
    return data;
  },
};
