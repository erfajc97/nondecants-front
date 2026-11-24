import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { MOCK_ENABLED } from '@/app/lib/mock';
import { cachedServerFetch } from '@/app/lib/serverCache';
import { MOCK_BANNERS } from '@/app/features/landing/data';
import type { Banner } from '@/app/types/global.types';

const asList = (data: any): Banner[] => {
  const result = data?.data ?? data;
  return Array.isArray(result) ? result : [];
};

/**
 * Banners del hero. Lanza si la API falla (429, red…): así React Query reintenta
 * en vez de guardar una lista vacía como si fuera la respuesta buena.
 */
export const fetchVisibleBanners = async (): Promise<Banner[]> => {
  if (MOCK_ENABLED) return MOCK_BANNERS;
  const { data } = await axiosInstance.get(`${API_ENDPOINTS.BANNERS}/visible`);
  return asList(data);
};

/**
 * Para el SSR de la home: caché de 60 s en memoria (una llamada por minuto a la
 * API, no una por visita) y, si la API falla, la última lista buena. Nunca
 * devuelve una lista vacía por un error si ya hubo una buena.
 */
export const fetchVisibleBannersServer = async (): Promise<Banner[]> => {
  try {
    return await cachedServerFetch('banners:visible', 60_000, fetchVisibleBanners, (list) => list.length > 0);
  } catch {
    return []; // el cliente los vuelve a pedir al hidratar
  }
};

const RETRY_DELAY = (attempt: number) => Math.min(1500 * 2 ** attempt, 20_000);

export const useBannersQuery = (enabled = true, initialData?: Banner[]) =>
  useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: fetchVisibleBanners,
    enabled,
    staleTime: 1000 * 60 * 10,
    initialData,
    retry: 4,
    retryDelay: RETRY_DELAY,
    // Si llegó vacío (el SSR no pudo pedirlos) se vuelve a intentar cada 15 s.
    refetchInterval: (query) => (query.state.data?.length ? false : 15_000),
  });

export type CatalogBannerSlot = 'catalog_perfumes' | 'catalog_bajo_pedido';

// Lanza si la API falla: React Query reintenta en vez de recordar "sin banner".
const fetchBannersByType = async (type: string): Promise<Banner[]> => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.BANNERS_BY_TYPE, {
    params: { type },
  });
  return asList(data);
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
    retry: 3,
    retryDelay: RETRY_DELAY,
  });
