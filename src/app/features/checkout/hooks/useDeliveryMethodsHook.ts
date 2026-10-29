import { useMemo } from 'react';
import type { DeliveryOption } from '@/app/types/global.types';

const GYE_CITIES = ['guayaquil', 'durán', 'duran', 'samborondón', 'samborondon'];

const STATIC_DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'entrega-personal', method: 'ENTREGA_PERSONAL', label: 'Entrega personal Plaza Tía (La Joya)', cost: 0, cities: ['guayaquil'] },
  { id: 'retiro-piwu', method: 'RETIRO_PIWU', label: 'Retiro en Piwu Market (Urdesa)', cost: 0, cities: ['guayaquil'] },
  { id: 'servientrega-gye', method: 'SERVIENTREGA_GYE', label: 'Servientrega (Guayaquil - Durán - Samborondón)', cost: 3, cities: GYE_CITIES },
  { id: 'servientrega-nacional', method: 'SERVIENTREGA_NACIONAL', label: 'Servientrega Nacional (Provincias)', cost: 6.5, cities: [] },
];

export function useDeliveryMethodsHook(city: string) {
  const methods = useMemo(() => {
    if (!city) return STATIC_DELIVERY_OPTIONS;
    const normalizedCity = city.toLowerCase().trim();

    return STATIC_DELIVERY_OPTIONS.filter((opt) => {
      // "Envío Provincias" available when city is NOT in GYE area
      if (opt.method === 'SERVIENTREGA_NACIONAL') {
        return !GYE_CITIES.includes(normalizedCity);
      }
      // Other methods: available if city is in their cities list
      return opt.cities.includes(normalizedCity);
    });
  }, [city]);

  return { methods, isLoading: false };
}
