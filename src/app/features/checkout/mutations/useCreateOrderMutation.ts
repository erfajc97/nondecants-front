import { useMutation } from '@tanstack/react-query';
import { checkoutService } from '../services/checkoutService';
import { useCartStore } from '@/app/store/cart/cartStore';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { CreateOrderPayload } from '../types';

export function useCreateOrderMutation() {
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => checkoutService.createOrder(payload),

    onSuccess: (order) => {
      clearCart();
      sonnerResponse('¡Orden creada exitosamente!', 'success');
      window.location.href = `/orden/${order.id}`;
    },

    onError: () => {
      sonnerResponse('Error al crear la orden. Intenta de nuevo.', 'error');
    },
  });
}
