import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { getDeliveryZoneByCity, getDeliveryCost } from '@/app/helpers/getDeliveryCost';
import { usePricingSettings, type PricingSettings } from '@/app/lib/pricingSettings';
import type { DeliveryOption } from '@/app/types/global.types';

const fetchDeliveryMethods = async (city: string, pricing: PricingSettings): Promise<DeliveryOption[]> => {
  try {
    const { data } = await axiosInstance.get(API_ENDPOINTS.DELIVERY_METHODS, {
      params: { city },
    });
    return data?.content ?? data ?? [];
  } catch {
    // Fallback con lógica local si el endpoint no responde
    const zone = getDeliveryZoneByCity(city);
    const cost = getDeliveryCost(zone, pricing);
    return [
      {
        id: zone,
        method: zone === 'retiro' ? 'RETIRO' : zone === 'gye' ? 'SERVIENTREGA_GYE' : 'SERVIENTREGA_NACIONAL',
        label: zone === 'retiro' ? 'Retiro en tienda' : zone === 'gye' ? 'Servientrega GYE/Sam/Durán' : 'Servientrega Provincias',
        cost,
        cities: [],
      },
    ];
  }
};

export const useDeliveryMethodsByCityQuery = (city: string, enabled = true) => {
  const pricing = usePricingSettings();
  return useQuery<DeliveryOption[]>({
    queryKey: ['delivery-methods', city, pricing.shippingGye, pricing.shippingNacional],
    queryFn: () => fetchDeliveryMethods(city, pricing),
    enabled: enabled && city.length > 0,
    staleTime: 1000 * 60 * 30, // 30 min
  });
};
