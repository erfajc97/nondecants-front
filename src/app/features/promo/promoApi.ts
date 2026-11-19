import { useEffect, useState } from 'react';
import axiosInstance from '@/app/config/axiosConfig';

/** Config pública de la promo "N decants: el más barato al X %" (la define el admin). */
export interface PromoConfig {
  active: boolean;
  every: number;
  percent: number;
  combineWithCoupons: boolean;
  barText: string;
}

export const PROMO_INACTIVE: PromoConfig = {
  active: false,
  every: 3,
  percent: 50,
  combineWithCoupons: false,
  barText: '',
};

export interface PromoPreviewLine {
  index: number;
  discountedUnits: number;
  discount: number;
  unitDiscount: number;
}

export interface PromoPreview {
  active: boolean;
  applied: boolean;
  every: number;
  percent: number;
  combineWithCoupons: boolean;
  barText: string;
  decantUnits: number;
  discountedUnits: number;
  total: number;
  lines: PromoPreviewLine[];
}

export interface PromoPreviewItem {
  productId?: number;
  productVariationId?: number;
  quantity: number;
}

let configCache: Promise<PromoConfig> | null = null;

// Sin react-query a propósito: las tarjetas se montan también en islas sin
// QueryClientProvider (ej. RelatedProducts.astro) y la barra superior vive en el navbar.
export function loadPromoConfig(): Promise<PromoConfig> {
  if (!configCache) {
    configCache = axiosInstance
      .get('/promotions/decants')
      .then(({ data }) => {
        const r = data?.data ?? data ?? {};
        return {
          active: !!r.active,
          every: Number(r.every) || 3,
          percent: Number(r.percent) || 50,
          combineWithCoupons: !!r.combineWithCoupons,
          barText: String(r.barText ?? ''),
        } satisfies PromoConfig;
      })
      .catch(() => PROMO_INACTIVE);
  }
  return configCache;
}

export function usePromoConfig(): PromoConfig {
  const [config, setConfig] = useState<PromoConfig>(PROMO_INACTIVE);
  useEffect(() => {
    let alive = true;
    loadPromoConfig().then((c) => {
      if (alive) setConfig(c);
    });
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

/** El cálculo vive en el servidor: aquí solo se pide y se muestra. */
export async function fetchPromoPreview(items: PromoPreviewItem[], signal?: AbortSignal): Promise<PromoPreview> {
  const { data } = await axiosInstance.post('/promotions/decants/preview', { items }, { signal });
  return (data?.data ?? data) as PromoPreview;
}
