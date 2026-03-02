import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import type { Order } from '@/app/types/global.types';

export const orderService = {
  getById: async (id: string): Promise<Order> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.ORDER}/${id}`);
    return data?.content ?? data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.MY_ORDERS);
    return data?.content ?? data ?? [];
  },
};
