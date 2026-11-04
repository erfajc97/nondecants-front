import { PRICING_DEFAULTS } from '@/app/lib/pricingSettings';

// Recargo para pagos con tarjeta Payphone (porcentaje desde ajustes, defecto 6)
export const calcPayphoneSurcharge = (
  subtotal: number,
  pct: number = PRICING_DEFAULTS.payphoneSurchargePct,
): number => {
  return parseFloat((subtotal * (pct / 100)).toFixed(2));
};

export const calcTotalWithSurcharge = (
  subtotal: number,
  pct: number = PRICING_DEFAULTS.payphoneSurchargePct,
): number => {
  return parseFloat((subtotal * (1 + pct / 100)).toFixed(2));
};
