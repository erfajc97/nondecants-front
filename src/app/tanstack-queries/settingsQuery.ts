import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { DEFAULT_DISPATCH_CUTOFF_HOUR } from '@/app/helpers/deliveryWindow';

async function readSettingNumber(key: string, fallback: number, min = 0): Promise<number> {
  try {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.SETTINGS}/${key}`);
    const value = Number(data?.data?.value ?? data?.value);
    return Number.isFinite(value) && value >= min ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Días adicionales de entrega configurados en el admin
 * (setting `delivery_days_offset`). Si no existe, 0.
 */
export function useDeliveryOffsetQuery() {
  return useQuery({
    queryKey: ['settings', 'delivery_days_offset'],
    queryFn: () => readSettingNumber('delivery_days_offset', 0),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hora de corte de despacho en Ecuador (setting `dispatch_cutoff_hour`).
 * Confirmado antes de esa hora → sale hoy; después → mañana. Defecto 15.
 */
export function useDispatchCutoffQuery() {
  return useQuery({
    queryKey: ['settings', 'dispatch_cutoff_hour'],
    queryFn: () => readSettingNumber('dispatch_cutoff_hour', DEFAULT_DISPATCH_CUTOFF_HOUR),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Subtotal mínimo para envío gratis (`free_shipping_threshold`).
 * 0 = promo desactivada.
 */
export function useFreeShippingThresholdQuery() {
  return useQuery({
    queryKey: ['settings', 'free_shipping_threshold'],
    queryFn: () => readSettingNumber('free_shipping_threshold', 0),
    staleTime: 1000 * 60 * 5,
  });
}
