import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import type {
  CanReviewResult,
  ProductReviewsData,
  Review,
} from '@/app/features/reviews/types';

const EMPTY: ProductReviewsData = { average: 0, count: 0, reviews: [] };

export const useLatestReviewsQuery = (limit = 9) =>
  useQuery<Review[]>({
    queryKey: ['reviews', 'latest', limit],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(API_ENDPOINTS.REVIEWS_LATEST, {
          params: { limit },
        });
        const result = data?.data ?? data;
        return Array.isArray(result) ? result : [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

export const useProductReviewsQuery = (productId: number | string) =>
  useQuery<ProductReviewsData>({
    queryKey: ['reviews', 'product', String(productId)],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(
          `${API_ENDPOINTS.REVIEWS_BY_PRODUCT}/${productId}`,
        );
        return (data?.data ?? data) as ProductReviewsData;
      } catch {
        return EMPTY;
      }
    },
    staleTime: 1000 * 60 * 2,
  });

export const useCanReviewQuery = (productId: number | string, enabled: boolean) =>
  useQuery<CanReviewResult>({
    queryKey: ['reviews', 'can-review', String(productId)],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${API_ENDPOINTS.REVIEWS_CAN_REVIEW}/${productId}`,
      );
      return (data?.data ?? data) as CanReviewResult;
    },
    enabled,
  });

export interface MyReview {
  productId: number;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
}

export const useMyReviewsQuery = (enabled: boolean) =>
  useQuery<MyReview[]>({
    queryKey: ['reviews', 'mine'],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_ENDPOINTS.REVIEWS_MINE);
      const result = data?.data ?? data;
      return Array.isArray(result) ? result : [];
    },
    enabled,
  });
