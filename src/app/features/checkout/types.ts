import type { PaymentMethod, DeliveryMethod, DeliveryOption } from '@/app/types/global.types';

export interface CustomerFormData {
  name:    string;
  email:   string;
  phone:   string;
  city:    string;
  address: string;
}

export interface CheckoutFormData {
  customer:        CustomerFormData;
  deliveryMethod:  DeliveryMethod | null;
  paymentMethod:   PaymentMethod | null;
}

export interface CreateOrderPayload {
  customerName:    string;
  customerEmail:   string;
  customerPhone:   string;
  city:            string;
  address:         string;
  deliveryMethod:  DeliveryMethod;
  paymentMethod:   PaymentMethod;
  items: {
    productId:  string;
    variantId:  string;
    quantity:   number;
    price:      number;
  }[];
}

export type { DeliveryOption, PaymentMethod, DeliveryMethod };
