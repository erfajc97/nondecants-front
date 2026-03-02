// Costo de envío según zona de entrega
export type DeliveryZone = 'retiro' | 'gye' | 'provincias';

const DELIVERY_COSTS: Record<DeliveryZone, number> = {
  retiro:     0,   // Retiro en tienda (Daule)
  gye:        3,   // Guayaquil / Samborondón / Durán
  provincias: 7,   // Resto del país
};

// Ciudades de la zona GYE ($3)
const GYE_CITIES = ['guayaquil', 'samborondon', 'samborondón', 'duran', 'durán'];

export const getDeliveryCost = (zone: DeliveryZone): number => DELIVERY_COSTS[zone];

export const getDeliveryZoneByCity = (city: string): DeliveryZone => {
  const normalized = city.toLowerCase().trim();
  if (normalized === 'daule' || normalized === 'retiro') return 'retiro';
  if (GYE_CITIES.includes(normalized)) return 'gye';
  return 'provincias';
};
