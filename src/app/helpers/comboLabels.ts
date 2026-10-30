import type { CartItem } from '@/app/store/cart/cartStore';

/** Nombre visible de una línea de combo: "Combo Trío Árabe". */
export function comboTitle(item: CartItem): string {
  return `Combo ${item.name.replace(/^combo\s+/i, '')}`;
}

/** Detalle de tamaño de un combo: "3 decants de 5 ml". */
export function comboSubtitle(item: CartItem): string {
  const n = item.comboDecants ?? item.comboProducts?.length ?? 0;
  const size = item.size ?? (item.ml > 0 && item.ml < 30 ? item.ml : 0);
  return `${n} decants${size ? ` de ${size} ml` : ''}`;
}
