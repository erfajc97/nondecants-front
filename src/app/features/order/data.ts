import type { Order } from '@/app/types/global.types';

export const MOCK_ORDER: Order = {
  id: 'ord-demo-001-nondecants',
  status: 'CONFIRMED',
  paymentMethod: 'PAYPHONE',
  deliveryMethod: 'SERVIENTREGA_GYE',
  subtotal: 60,
  deliveryCost: 3,
  payphoneSurcharge: 3.78,
  total: 66.78,
  customerName: 'María García',
  customerEmail: 'maria@ejemplo.com',
  customerPhone: '0991234567',
  city: 'Guayaquil',
  address: 'Av. 9 de Octubre 123, Piso 2',
  trackingCode: undefined,
  items: [
    { productId: 'p4', variantId: 'p4-v1', name: 'Bleu de Chanel EDP', ml: 10, price: 22, quantity: 1 },
    { productId: 'p5', variantId: 'p5-v2', name: 'Spicebomb Extreme', ml: 10, price: 21, quantity: 1 },
    { productId: 'p7', variantId: 'p7-v1', name: 'Perfume Árabe Lattafa', ml: 100, price: 17, quantity: 1 },
  ],
  createdAt: '2026-03-01T15:30:00Z',
  updatedAt: '2026-03-01T15:31:00Z',
};
