import { useCartStore, type CartItem } from '@/app/store/cart/cartStore';
import { ESTIMATED_SHIPPING } from '@/app/features/checkout/data';
import { splitCartStock, getSplit } from '@/app/helpers/cartStockSplit';
import { DEFAULT_DISPATCH_CUTOFF_HOUR } from '@/app/helpers/deliveryWindow';
import {
  useDeliveryOffsetQuery,
  useDispatchCutoffQuery,
  useFreeShippingThresholdQuery,
} from '@/app/tanstack-queries/settingsQuery';
import { useCouponStore } from '@/app/store/coupon/couponStore';

export interface CartRow {
  item: CartItem;
  /** Unidades de este item que pertenecen a este grupo. */
  portionQty: number;
  /** Cantidad total del item (suma de ambos grupos). */
  total: number;
  /** El item también tiene unidades en el otro grupo (está partido). */
  split: boolean;
}

/**
 * Lógica de la página de carrito: separa los items en dos grupos (envío
 * inmediato vs bajo pedido). Un mismo producto puede aparecer en AMBOS cuando
 * la cantidad pedida supera el stock disponible (excedente bajo pedido).
 * El reparto es a nivel de carrito: frascos y decants del mismo producto
 * comparten inventario (ver `splitCartStock`).
 */
export function useCartPageHook() {
  const items       = useCartStore((s) => s.items);
  const removeItem  = useCartStore((s) => s.removeItem);
  const updateQty   = useCartStore((s) => s.updateQty);
  const hasHydrated = useCartStore((s) => s._hasHydrated);
  const { data: deliveryOffset = 0 } = useDeliveryOffsetQuery();
  const { data: cutoffHour = DEFAULT_DISPATCH_CUTOFF_HOUR } = useDispatchCutoffQuery();
  const { data: freeShippingThreshold = 0 } = useFreeShippingThresholdQuery();
  const couponDiscount = useCouponStore((s) => (s.applied ? s.discount : 0));
  const couponFreeShipping = useCouponStore((s) => s.applied && s.freeShipping);

  const immediate: CartRow[] = [];
  const bajo: CartRow[] = [];
  let immediateSubtotal = 0;
  let bajoSubtotal = 0;

  const splits = splitCartStock(items);

  for (const item of items) {
    const { inStock, bajo: bajoQty } = getSplit(splits, item);
    const isSplit = inStock > 0 && bajoQty > 0;
    if (inStock > 0) {
      immediate.push({ item, portionQty: inStock, total: item.quantity, split: isSplit });
      immediateSubtotal += item.price * inStock;
    }
    if (bajoQty > 0) {
      bajo.push({ item, portionQty: bajoQty, total: item.quantity, split: isSplit });
      bajoSubtotal += item.price * bajoQty;
    }
  }

  const immediateCount = immediate.reduce((a, r) => a + r.portionQty, 0);
  const bajoCount = bajo.reduce((a, r) => a + r.portionQty, 0);
  const subtotal = immediateSubtotal + bajoSubtotal;
  const afterDiscount = Math.max(0, subtotal - couponDiscount);
  const qualifiesFreeShipping =
    couponFreeShipping ||
    (freeShippingThreshold > 0 && afterDiscount >= freeShippingThreshold);
  const shipping = items.length > 0 && !qualifiesFreeShipping ? ESTIMATED_SHIPPING : 0;
  const total = afterDiscount + shipping;
  const itemCount = items.reduce((a, i) => a + i.quantity, 0);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - afterDiscount);

  return {
    items,
    immediate,
    bajo,
    immediateSubtotal,
    bajoSubtotal,
    immediateCount,
    bajoCount,
    subtotal,
    afterDiscount,
    shipping,
    total,
    itemCount,
    removeItem,
    updateQty,
    hasHydrated,
    deliveryOffset,
    cutoffHour,
    freeShippingThreshold,
    qualifiesFreeShipping,
    remainingForFreeShipping,
    couponDiscount,
  };
}
