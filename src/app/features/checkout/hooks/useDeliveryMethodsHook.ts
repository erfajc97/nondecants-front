import { useMemo } from 'react';
import { usePricingSettings } from '@/app/lib/pricingSettings';
import type { DeliveryOption } from '@/app/types/global.types';

const GYE_CITIES = ['guayaquil', 'durán', 'duran', 'samborondón', 'samborondon'];

export function useDeliveryMethodsHook(city: string) {
  const { shippingGye, shippingNacional } = usePricingSettings();

  const methods = useMemo(() => {
    const all: DeliveryOption[] = [
      { id: 'entrega-personal', method: 'ENTREGA_PERSONAL', label: 'Entrega personal Plaza Tía (La Joya)', cost: 0, cities: ['guayaquil'] },
      { id: 'retiro-piwu', method: 'RETIRO_PIWU', label: 'Retiro en Piwu Market (Urdesa)', cost: 0, cities: ['guayaquil'] },
      { id: 'servientrega-gye', method: 'SERVIENTREGA_GYE', label: 'Servientrega (Guayaquil - Durán - Samborondón)', cost: shippingGye, cities: GYE_CITIES },
      { id: 'servientrega-nacional', method: 'SERVIENTREGA_NACIONAL', label: 'Servientrega Nacional (Provincias)', cost: shippingNacional, cities: [] },
    ];
    if (!city) return all;
    const normalizedCity = city.toLowerCase().trim();

    return all.filter((opt) => {
      // "Envío Provincias" available when city is NOT in GYE area
      if (opt.method === 'SERVIENTREGA_NACIONAL') {
        return !GYE_CITIES.includes(normalizedCity);
      }
      // Other methods: available if city is in their cities list
      return opt.cities.includes(normalizedCity);
    });
  }, [city, shippingGye, shippingNacional]);

  return { methods, isLoading: false };
}
