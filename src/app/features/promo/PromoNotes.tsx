import { usePromoConfig } from './promoApi';
import type { DecantPromoState } from './useDecantPromo';

/**
 * Texto neutral del avance de la promo en el carrito. Sin presión: no sugiere
 * llegar al siguiente descuento.
 *  - 1–2 decants: "Promo 3 decants: llevas 2 de 3"
 *  - exactamente N: "…llevas 3 de 3 · se aplicó 1 descuento"
 *  - más: "…llevas 4 · se aplicó 1 descuento"
 *  - 0 decants: nada.
 */
export function promoStatusText(promo: Pick<DecantPromoState, 'config' | 'decantUnits' | 'discountedUnits'>): string {
  const { config, decantUnits, discountedUnits } = promo;
  if (!config.active || decantUnits <= 0) return '';
  const head = `Promo ${config.every} decants:`;
  if (discountedUnits <= 0) return `${head} llevas ${decantUnits} de ${config.every}`;
  const applied = discountedUnits === 1 ? 'se aplicó 1 descuento' : `se aplicaron ${discountedUnits} descuentos`;
  return decantUnits === config.every
    ? `${head} llevas ${decantUnits} de ${config.every} · ${applied}`
    : `${head} llevas ${decantUnits} · ${applied}`;
}

/** Línea de estado de la promo (carrito y checkout). */
export function PromoStatusLine({ promo, className = '' }: { promo: DecantPromoState; className?: string }) {
  const text = promoStatusText(promo);
  if (!text) return null;
  return (
    <p className={`font-body text-[13px] text-text-muted ${className}`} role="status">
      {text}
    </p>
  );
}

/** Etiqueta discreta de tarjetas y ficha de decants (nunca sobre la foto). */
export function PromoTag({ className = '' }: { className?: string }) {
  const config = usePromoConfig();
  if (!config.active) return null;
  return (
    <span className={`block font-body text-[11.5px] leading-snug text-text-muted ${className}`}>
      {config.every} decants: el más barato al {config.percent} %
    </span>
  );
}

/** Aclaración bajo los tamaños de la ficha (solo con un decant elegido). */
export function PromoDecantNote({ className = '' }: { className?: string }) {
  const config = usePromoConfig();
  if (!config.active) return null;
  return (
    <p className={`font-body text-[13px] leading-snug text-text-muted ${className}`}>
      <b className="font-semibold text-text-soft">
        {config.every} decants: el más barato al {config.percent} %.
      </b>{' '}
      Aplica a decants de cualquier tamaño, sumando unidades. No aplica a frascos sellados.
    </p>
  );
}
