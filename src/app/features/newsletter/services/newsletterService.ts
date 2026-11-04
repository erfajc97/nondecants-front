import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';

export interface SubscribePayload {
  email: string;
  firstName?: string;
}

export const newsletterService = {
  subscribe: async (payload: SubscribePayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.NEWSLETTER_SUBSCRIBE, payload);
    return data?.data ?? data;
  },
};
