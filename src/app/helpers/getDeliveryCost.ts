import { PRICING_DEFAULTS, type PricingSettings } from '@/app/lib/pricingSettings';

// Costo de envío según zona de entrega
export type DeliveryZone = 'retiro' | 'gye' | 'provincias';

// Ciudades de la zona GYE
const GYE_CITIES = ['guayaquil', 'samborondon', 'samborondón', 'duran', 'durán'];

export const getDeliveryCost = (
  zone: DeliveryZone,
  pricing: PricingSettings = PRICING_DEFAULTS,
): number => {
  if (zone === 'retiro') return 0; // Retiro en tienda
  return zone === 'gye' ? pricing.shippingGye : pricing.shippingNacional;
};

export const getDeliveryZoneByCity = (city: string): DeliveryZone => {
  const normalized = city.toLowerCase().trim();
  if (normalized === 'daule' || normalized === 'retiro') return 'retiro';
  if (GYE_CITIES.includes(normalized)) return 'gye';
  return 'provincias';
};
