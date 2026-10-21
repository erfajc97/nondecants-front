import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';

interface CreateReviewPayload {
  productId: number;
  rating: number;
  comment: string;
}

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const { data } = await axiosInstance.post(API_ENDPOINTS.REVIEWS, payload);
      return data?.data ?? data;
    },
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['reviews', 'can-review', String(vars.productId)],
      });
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'mine'] });
      sonnerResponse('¡Gracias! Tu reseña será publicada cuando la aprobemos.', 'success');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      sonnerResponse(
        (Array.isArray(msg) ? msg[0] : msg) ?? 'No pudimos enviar tu reseña',
        'error',
      );
    },
  });
};
