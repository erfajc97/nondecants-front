import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { MOCK_ENABLED } from '@/app/lib/mock';
import { MOCK_BANNERS } from '@/app/features/landing/data';
import type { Banner } from '@/app/types/global.types';

const fetchBanners = async (): Promise<Banner[]> => {
  if (MOCK_ENABLED) return MOCK_BANNERS;
  const { data } = await axiosInstance.get(API_ENDPOINTS.BANNERS);
  return data?.content ?? data ?? [];
};

export const useBannersQuery = (enabled = true) =>
  useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: fetchBanners,
    enabled,
    staleTime: 1000 * 60 * 10,
  });
