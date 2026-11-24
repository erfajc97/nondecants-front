import { formatCurrency } from '@/app/helpers/formatCurrency';
import { referenceSavingPct } from '@/app/helpers/referencePrice';

interface ReferencePriceProps {
  /** Precio de referencia en tiendas (tachado). */
  reference?: number | null;
  /** Precio real que se cobra. */
  price: number;
  className?: string;
}

/**
 * "$199,99 $159,99 −20 %": precio anterior tachado + descuento, sin texto
 * adicional. Es solo visual: el cobro siempre usa `price`.
 */
export default function ReferencePrice({ reference, price, className = '' }: ReferencePriceProps) {
  const pct = referenceSavingPct(reference, price);
  if (pct == null || !reference) return null;
  return (
    <p className={`font-body text-xs text-text-muted ${className}`}>
      <span className="inline-flex flex-wrap items-baseline gap-x-2">
        <s aria-label={`Precio anterior ${formatCurrency(reference)}`}>{formatCurrency(reference)}</s>
        <b className="font-semibold text-text">{formatCurrency(price)}</b>
        <span className="rounded-full bg-gold-light px-1.5 py-px text-[11px] font-semibold text-accent-hover">−{pct}%</span>
      </span>
    </p>
  );
}
