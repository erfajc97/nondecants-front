import { useCartStore } from '@/app/store/cart/cartStore';

export function useCartHook() {
  const items        = useCartStore((s) => s.items);
  const total        = useCartStore((s) => s.total());
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const removeItem   = useCartStore((s) => s.removeItem);
  const updateQty    = useCartStore((s) => s.updateQty);
  const clearCart    = useCartStore((s) => s.clearCart);

  return { items, total, isDrawerOpen, setDrawerOpen, removeItem, updateQty, clearCart };
}
