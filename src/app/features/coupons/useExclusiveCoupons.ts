import { useEffect, useState } from 'react';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';

export interface ExclusiveBadge {
  label: string;
  code: string | null;
  /** 'percentage' | 'fixed_amount' | 'free_shipping' */
  type: string;
  value: number;
  /** Monto mínimo de compra para que aplique (null = sin mínimo). */
  minOrderAmount: number | null;
}

interface ExclusiveData {
  products: Record<string, ExclusiveBadge>;
  variations: Record<string, ExclusiveBadge>;
}

const toBadge = (r: any): ExclusiveBadge => ({
  label: r.label,
  code: r.code ?? null,
  type: r.type ?? 'percentage',
  value: Number(r.value ?? 0),
  minOrderAmount: r.minOrderAmount != null ? Number(r.minOrderAmount) : null,
});

const EMPTY: ExclusiveData = { products: {}, variations: {} };
let cache: Promise<ExclusiveData> | null = null;

// Sin react-query a propósito: ProductCard se monta también en islas sin
// QueryClientProvider (ej. RelatedProducts.astro). Una sola petición compartida.
function load(): Promise<ExclusiveData> {
  if (!cache) {
    cache = axiosInstance
      .get(API_ENDPOINTS.COUPONS_EXCLUSIVE)
      .then(({ data }) => {
        const r = data?.data ?? data ?? {};
        const out: ExclusiveData = { products: {}, variations: {} };
        for (const p of r.products ?? []) {
          out.products[String(p.productId)] = toBadge(p);
        }
        for (const v of r.variations ?? []) {
          out.variations[String(v.variationId)] = toBadge(v);
          // Un producto con variante exclusiva también muestra la etiqueta en el listado.
          out.products[String(v.productId)] ??= toBadge(v);
        }
        return out;
      })
      .catch(() => EMPTY);
  }
  return cache;
}

export function useExclusiveCoupons(): ExclusiveData {
  const [data, setData] = useState<ExclusiveData>(EMPTY);
  useEffect(() => {
    let alive = true;
    load().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
