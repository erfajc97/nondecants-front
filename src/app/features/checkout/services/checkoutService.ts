import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import type { CreateOrderPayload } from '../types';
import type { Order } from '@/app/types/global.types';

export const checkoutService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.ORDERS, payload);
    return data?.content ?? data;
  },
};
