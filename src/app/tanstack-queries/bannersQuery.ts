import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { MOCK_ENABLED } from '@/app/lib/mock';
import { MOCK_BANNERS } from '@/app/features/landing/data';
import type { Banner } from '@/app/types/global.types';

export const fetchVisibleBanners = async (): Promise<Banner[]> => {
  if (MOCK_ENABLED) return MOCK_BANNERS;
  try {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.BANNERS}/visible`);
    const result = data?.data ?? data;
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
};

export const useBannersQuery = (enabled = true, initialData?: Banner[]) =>
  useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: fetchVisibleBanners,
    enabled,
    staleTime: 1000 * 60 * 10,
    initialData,
  });

export type CatalogBannerSlot = 'catalog_perfumes' | 'catalog_bajo_pedido';

const fetchBannersByType = async (type: string): Promise<Banner[]> => {
  try {
    const { data } = await axiosInstance.get(API_ENDPOINTS.BANNERS_BY_TYPE, {
      params: { type },
    });
    const result = data?.data ?? data;
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
};

/** Primer banner visible de la página Perfumes o Bajo pedido. */
export const useCatalogPageBanner = (slot?: CatalogBannerSlot, enabled = true) =>
  useQuery<Banner | null>({
    queryKey: ['banners', 'by-type', slot],
    queryFn: async () => {
      const list = await fetchBannersByType(slot!);
      return list[0] ?? null;
    },
    enabled: Boolean(slot) && enabled,
    staleTime: 1000 * 60 * 10,
  });
