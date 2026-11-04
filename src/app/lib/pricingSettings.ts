import { getSetting, getSettingsServer, useSettingsMap, type SettingsMap } from './siteSettings';

/**
 * Envío y recargo Payphone, editables desde ajustes. Deben coincidir con lo que
 * cobra el backend (mismas claves, mismo respaldo 3 / 6.5 / 6 %).
 */
export interface PricingSettings {
  shippingGye: number;
  shippingNacional: number;
  /** Porcentaje (6 = 6 %). */
  payphoneSurchargePct: number;
}

export const PRICING_DEFAULTS: PricingSettings = {
  shippingGye: 3,
  shippingNacional: 6.5,
  payphoneSurchargePct: 6,
};

export function pricingFromMap(map: SettingsMap | undefined): PricingSettings {
  if (!map) return PRICING_DEFAULTS;
  return {
    shippingGye: getSetting(map, 'shipping_gye', PRICING_DEFAULTS.shippingGye),
    shippingNacional: getSetting(map, 'shipping_nacional', PRICING_DEFAULTS.shippingNacional),
    payphoneSurchargePct: getSetting(map, 'payphone_surcharge_pct', PRICING_DEFAULTS.payphoneSurchargePct),
  };
}

/** Para páginas `.astro`. */
export async function getPricingServer(): Promise<PricingSettings> {
  return pricingFromMap(await getSettingsServer());
}

/** Para islas React: defectos mientras carga o si no hay ajustes. */
export function usePricingSettings(): PricingSettings {
  return pricingFromMap(useSettingsMap() ?? undefined);
}

/** "$3" si es entero, "$6,50" si tiene decimales (para textos corridos). */
export function formatUsdText(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2).replace('.', ',')}`;
}

/** Siempre con dos decimales: "$3,00". */
export function formatUsdFixed(n: number): string {
  return `$${n.toFixed(2).replace('.', ',')}`;
}

/** "6" / "6,5" para "6%". */
export function formatPct(n: number): string {
  return String(n).replace('.', ',');
}
