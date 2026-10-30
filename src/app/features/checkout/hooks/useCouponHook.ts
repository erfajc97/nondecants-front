import { useState } from 'react';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { useCouponStore } from '@/app/store/coupon/couponStore';
import { useCartStore } from '@/app/store/cart/cartStore';
import { DEMO_ENABLED } from '@/app/lib/mock';

const DEMO_COUPON_ERROR = 'Ese código no existe o ya venció.';

interface CouponResult {
  valid: boolean;
  discount: number;
  freeShipping: boolean;
  message: string;
  itemDiscounts?: { productId?: number; productVariationId?: number; discount: number }[];
}

export function useCouponHook() {
  const [loading, setLoading] = useState(false);
  const code = useCouponStore((s) => s.code);
  const discount = useCouponStore((s) => s.discount);
  const freeShipping = useCouponStore((s) => s.freeShipping);
  const applied = useCouponStore((s) => s.applied);
  const message = useCouponStore((s) => s.message);
  const setCode = useCouponStore((s) => s.setCode);
  const apply = useCouponStore((s) => s.apply);
  const clear = useCouponStore((s) => s.clear);

  const productSubtotal = useCartStore((s) =>
    s.items
      .filter((i) => i.comboId == null)
      .reduce((acc, i) => acc + i.price * i.quantity, 0),
  );
  const cartItems = useCartStore((s) => s.items);
  const hasNonComboItems = useCartStore((s) => s.items.some((i) => i.comboId == null));

  const allSubtotal = useCartStore((s) => s.items.reduce((acc, i) => acc + i.price * i.quantity, 0));

  /** Demo sin backend: cupones fijos validados en cliente. Devuelve si fue válido. */
  const applyDemo = (): boolean => {
    const c = code.trim().toUpperCase();
    const round = (n: number) => Math.round(n * 100) / 100;
    let raw = 0;
    if (c === 'NOD') raw = 5;
    else if (c === 'NOD10') raw = allSubtotal * 0.1;
    else {
      useCouponStore.setState({ applied: false, discount: 0, freeShipping: false, message: DEMO_COUPON_ERROR, itemDiscounts: [] });
      return false;
    }
    const discount = round(Math.min(raw, allSubtotal));
    const message = c === 'NOD' ? 'Código NOD: $5 de descuento' : 'Código NOD10: 10% de descuento';
    apply({ discount, freeShipping: false, message, itemDiscounts: [] });
    return true;
  };

  const handleApply = async (): Promise<boolean> => {
    if (!code.trim()) return false;
    if (DEMO_ENABLED) return applyDemo();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.COUPONS_VALIDATE, {
        code,
        orderAmount: productSubtotal,
        // Líneas del carrito (sin combos): el servidor decide cuáles son elegibles.
        items: cartItems
          .filter((i) => i.comboId == null)
          .map((i) => ({
            productId: parseInt(i.productId, 10),
            ...(i.variantId.startsWith('full-') ? {} : { productVariationId: parseInt(i.variantId, 10) }),
            price: i.price,
            quantity: i.quantity,
          })),
      });
      const result: CouponResult = data?.data ?? data;
      if (result.valid) {
        apply({
          discount: result.discount,
          freeShipping: result.freeShipping,
          message: result.message,
          itemDiscounts: result.itemDiscounts,
        });
        sonnerResponse(result.message, 'success');
        return true;
      } else {
        useCouponStore.setState({
          applied: false,
          discount: 0,
          freeShipping: false,
          message: result.message,
          itemDiscounts: [],
        });
        sonnerResponse(result.message, 'error');
        return false;
      }
    } catch {
      useCouponStore.setState({ message: 'Error al validar el cupón' });
      sonnerResponse('Error al validar el cupón', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    couponCode: code,
    couponDiscount: discount,
    couponFreeShipping: freeShipping,
    couponApplied: applied,
    couponLoading: loading,
    couponMessage: message,
    hasNonComboItems,
    setCouponCode: (next: string) => setCode(next.toUpperCase()),
    handleApplyCoupon: handleApply,
    handleRemoveCoupon: clear,
  };
}
