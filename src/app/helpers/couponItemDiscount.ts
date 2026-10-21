import type { CartItem } from '@/app/store/cart/cartStore';

export interface CouponItemDiscount {
  productId?: number;
  productVariationId?: number;
  discount: number;
}

/** Descuento de cupón que cae sobre una línea del carrito (0 si no aplica). */
export function lineCouponDiscount(item: CartItem, discounts: CouponItemDiscount[]): number {
  if (item.comboId != null || !discounts.length) return 0;
  const isFull = item.variantId.startsWith('full-');
  const match = discounts.find((d) =>
    isFull
      ? d.productVariationId == null && Number(d.productId) === Number(item.productId)
      : Number(d.productVariationId) === Number(item.variantId),
  );
  return match?.discount ?? 0;
}
