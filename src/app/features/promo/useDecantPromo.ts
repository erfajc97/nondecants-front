import { useEffect, useMemo, useState } from 'react';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { useCouponStore } from '@/app/store/coupon/couponStore';
import type { CartItem } from '@/app/store/cart/cartStore';
import {
  fetchPromoPreview,
  usePromoConfig,
  type PromoConfig,
  type PromoPreview,
  type PromoPreviewItem,
} from './promoApi';

export interface PromoLineInfo {
  /** Monto descontado en toda la línea. */
  discount: number;
  /** Unidades de la línea que reciben el descuento. */
  discountedUnits: number;
  unitDiscount: number;
}

export interface DecantPromoState {
  config: PromoConfig;
  /** Hay descuento aplicado en el carrito ahora mismo. */
  applied: boolean;
  /** Decants (unidades, de cualquier tamaño) que cuentan para la promo. */
  decantUnits: number;
  discountedUnits: number;
  /** Suma de los descuentos: lo que devuelve la API. */
  total: number;
  /** Descuento de una línea del carrito (`variantId`), si lo hay. */
  lineFor: (variantId: string) => PromoLineInfo | undefined;
}

const NONE: Pick<DecantPromoState, 'applied' | 'decantUnits' | 'discountedUnits' | 'total'> = {
  applied: false,
  decantUnits: 0,
  discountedUnits: 0,
  total: 0,
};

/** Líneas que el servidor evalúa: solo ítems sueltos (los combos ya traen su descuento). */
function toPreviewLines(items: CartItem[]): { variantId: string; line: PromoPreviewItem }[] {
  return items
    .filter((i) => i.comboId == null)
    .map((i) => {
      const full = i.variantId.startsWith('full-');
      return {
        variantId: i.variantId,
        line: {
          productId: parseInt(i.productId, 10),
          ...(full ? {} : { productVariationId: parseInt(i.variantId, 10) }),
          quantity: i.quantity,
        },
      };
    });
}

/**
 * Promo "por cada N decants, el más barato al X %": pide el cálculo al servidor
 * (carrito, checkout y orden usan la misma regla) y lo expone por línea.
 * Si hay un cupón aplicado y la promo no se combina con cupones, lo quita.
 */
export function useDecantPromo(items: CartItem[]): DecantPromoState {
  const config = usePromoConfig();
  const couponApplied = useCouponStore((s) => s.applied);
  const clearCoupon = useCouponStore((s) => s.clear);
  const [result, setResult] = useState<{ key: string; preview: PromoPreview } | null>(null);

  const lines = useMemo(() => toPreviewLines(items), [items]);
  // Solo hace falta preguntar si hay decants (líneas con variante) y la promo está vigente.
  const hasDecants = lines.some((l) => l.line.productVariationId != null);
  const key = useMemo(() => JSON.stringify(lines.map((l) => l.line)), [lines]);

  useEffect(() => {
    if (!config.active || !hasDecants) {
      setResult(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchPromoPreview(
        lines.map((l) => l.line),
        controller.signal,
      )
        .then((preview) => setResult({ key, preview }))
        .catch(() => {
          // Sin respuesta no se inventa un descuento: el cálculo es del servidor.
          if (!controller.signal.aborted) setResult(null);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [config.active, hasDecants, key, lines]);

  // Mientras llega la respuesta de un cambio de carrito se muestra la anterior.
  const preview = config.active && hasDecants ? result?.preview : undefined;

  const byVariant = useMemo(() => {
    const map = new Map<string, PromoLineInfo>();
    if (!preview?.applied) return map;
    preview.lines.forEach((l) => {
      const variantId = lines[l.index]?.variantId;
      if (variantId && l.discount > 0) {
        map.set(variantId, { discount: l.discount, discountedUnits: l.discountedUnits, unitDiscount: l.unitDiscount });
      }
    });
    return map;
  }, [preview, lines]);

  const applied = !!preview?.applied;

  // El cupón no se combina con la promo: se mantiene la promo y se avisa.
  useEffect(() => {
    if (applied && !config.combineWithCoupons && couponApplied) {
      clearCoupon();
      sonnerResponse('Este cupón no se combina con la promo 3 decants', 'error');
    }
  }, [applied, config.combineWithCoupons, couponApplied, clearCoupon]);

  return {
    config,
    ...(preview ? { applied, decantUnits: preview.decantUnits, discountedUnits: preview.discountedUnits, total: preview.total } : NONE),
    lineFor: (variantId) => byVariant.get(variantId),
  };
}
