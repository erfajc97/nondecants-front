import { useDeliveryMethodsByCityQuery } from '@/app/tanstack-queries/deliveryMethodsQuery';
import { getDeliveryCost, getDeliveryZoneByCity } from '@/app/helpers/getDeliveryCost';

export function useDeliveryMethodsHook(city: string) {
  const { data: methods, isLoading } = useDeliveryMethodsByCityQuery(city);

  // Costo estimado local (fallback si la query no ha cargado)
  const estimatedCost = city
    ? getDeliveryCost(getDeliveryZoneByCity(city))
    : 0;

  return {
    methods: methods ?? [],
    isLoading,
    estimatedCost,
  };
}
