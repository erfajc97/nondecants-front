import type { Order, OrderStatus } from '@/app/types/global.types';

// === SHIPMENT TRACKER ===
export type SearchType = 'guia' | 'remision' | 'factura';

export const SEARCH_OPTIONS: { value: SearchType; label: string }[] = [
  { value: 'guia', label: 'Guía' },
  { value: 'remision', label: 'Remisión' },
  { value: 'factura', label: 'Factura' },
];

export const SEARCH_PLACEHOLDERS: Record<SearchType, string> = {
  guia: 'Número de Guía : Ejemplo 34353466',
  remision: 'Número de Remisión : Ejemplo 12345678',
  factura: 'Número de Factura : Ejemplo 87654321',
};

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  // Backend keys (current)
  order_created:   { label: 'Pendiente de pago', color: 'bg-gold-light text-warning border-warning/30' },
  order_received:  { label: 'Pagado',            color: 'bg-bg-alt text-text border-border' },
  order_accepted:  { label: 'Pagado',            color: 'bg-bg-alt text-text border-border' },
  order_shipped:   { label: 'Enviado',           color: 'bg-bg-alt text-text border-border' },
  order_delivered: { label: 'Entregado',         color: 'bg-success/10 text-success border-success/30' },
  order_delayed:   { label: 'Retrasado',         color: 'bg-gold-light text-warning border-warning/30' },
  order_cancelled: { label: 'Cancelado',         color: 'bg-error/10 text-error border-error/30' },
  order_rejected:  { label: 'Rechazado',         color: 'bg-error/10 text-error border-error/30' },
  // Legacy uppercase keys (mock / older data)
  PENDING:    { label: 'Pendiente',    color: 'bg-gold-light text-warning border-warning/30' },
  CONFIRMED:  { label: 'Confirmada',   color: 'bg-bg-alt text-text border-border' },
  PROCESSING: { label: 'En proceso',   color: 'bg-bg-alt text-text border-border' },
  SHIPPED:    { label: 'Enviada',      color: 'bg-bg-alt text-text border-border' },
  DELIVERED:  { label: 'Entregada',    color: 'bg-success/10 text-success border-success/30' },
  CANCELLED:  { label: 'Cancelada',    color: 'bg-error/10 text-error border-error/30' },
};

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
