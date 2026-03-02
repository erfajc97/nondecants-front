// ── Utilidades ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  content: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Enums de negocio ────────────────────────────────────
export type ProductType = 'SELLADO' | 'DECANT' | 'NONDECANT';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'PAYPHONE' | 'TRANSFERENCIA' | 'EFECTIVO';

export type DeliveryMethod = 'RETIRO' | 'SERVIENTREGA_GYE' | 'SERVIENTREGA_NACIONAL';

// ── Modelos de API ──────────────────────────────────────
export interface ProductVariant {
  id: string;
  ml: number;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  type: ProductType;
  image: string;
  images?: string[];
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export interface DeliveryOption {
  id: string;
  method: DeliveryMethod;
  label: string;
  cost: number;
  cities: string[];
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  ml: number;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  deliveryCost: number;
  payphoneSurcharge: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address?: string;
  trackingCode?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Parámetros de query comunes ─────────────────────────
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProductType;
  brand?: string;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt';
  order?: 'asc' | 'desc';
}
