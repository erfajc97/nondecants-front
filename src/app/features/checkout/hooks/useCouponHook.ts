import { useState } from 'react';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { useCouponStore } from '@/app/store/coupon/couponStore';
import { useCartStore } from '@/app/store/cart/cartStore';

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

  const handleApply = async () => {
    if (!code.trim()) return;
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
      } else {
        useCouponStore.setState({
          applied: false,
          discount: 0,
          freeShipping: false,
          message: result.message,
          itemDiscounts: [],
        });
        sonnerResponse(result.message, 'error');
      }
    } catch {
      useCouponStore.setState({ message: 'Error al validar el cupón' });
      sonnerResponse('Error al validar el cupón', 'error');
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
