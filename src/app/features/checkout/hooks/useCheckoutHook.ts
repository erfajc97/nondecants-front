import { useState } from 'react';
import { useCartStore } from '@/app/store/cart/cartStore';
import { useCreateOrderMutation } from '../mutations/useCreateOrderMutation';
import { useDeliveryMethodsHook } from './useDeliveryMethodsHook';
import { calcPayphoneSurcharge } from '@/app/helpers/calcPayphoneSurcharge';
import { getDeliveryCost, getDeliveryZoneByCity } from '@/app/helpers/getDeliveryCost';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { CustomerFormData, PaymentMethod, DeliveryMethod } from '../types';

const initialCustomer: CustomerFormData = {
  name:    '',
  email:   '',
  phone:   '',
  city:    '',
  address: '',
};

export function useCheckoutHook() {
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomer);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const items    = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.total());

  const { methods: deliveryOptions, isLoading: deliveryLoading } = useDeliveryMethodsHook(customer.city);

  // Cálculo de costos
  const deliveryCost = deliveryMethod
    ? (deliveryOptions.find((m) => m.method === deliveryMethod)?.cost ?? getDeliveryCost(getDeliveryZoneByCity(customer.city)))
    : 0;

  const isPayphone = paymentMethod === 'PAYPHONE';
  const payphoneSurcharge = isPayphone ? calcPayphoneSurcharge(subtotal + deliveryCost) : 0;
  const total = subtotal + deliveryCost + payphoneSurcharge;

  const { mutate: createOrder, isPending } = useCreateOrderMutation();

  const handleCustomerChange = (field: keyof CustomerFormData, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    // Reset delivery method al cambiar ciudad
    if (field === 'city') setDeliveryMethod(null);
  };

  const handleSubmit = () => {
    // Validaciones
    if (!customer.name || !customer.email || !customer.phone || !customer.city) {
      sonnerResponse('Completa los datos de contacto.', 'error');
      return;
    }
    if (!deliveryMethod) {
      sonnerResponse('Selecciona un método de entrega.', 'error');
      return;
    }
    if (!paymentMethod) {
      sonnerResponse('Selecciona un método de pago.', 'error');
      return;
    }
    if (items.length === 0) {
      sonnerResponse('Tu carrito está vacío.', 'error');
      return;
    }

    createOrder({
      customerName:   customer.name,
      customerEmail:  customer.email,
      customerPhone:  customer.phone,
      city:           customer.city,
      address:        customer.address,
      deliveryMethod,
      paymentMethod,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity:  i.quantity,
        price:     i.price,
      })),
    });
  };

  return {
    customer,
    deliveryMethod,
    paymentMethod,
    deliveryOptions,
    deliveryLoading,
    subtotal,
    deliveryCost,
    payphoneSurcharge,
    isPayphone,
    total,
    items,
    isPending,
    handleCustomerChange,
    setDeliveryMethod,
    setPaymentMethod,
    handleSubmit,
  };
}
