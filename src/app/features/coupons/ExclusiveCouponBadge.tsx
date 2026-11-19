import { formatCurrency } from '@/app/helpers/formatCurrency';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { useExclusiveCoupons, type ExclusiveBadge } from './useExclusiveCoupons';

/** "−5 %" / "−$5" / "" (envío gratis no lleva valor). */
function valueText(b: ExclusiveBadge): string {
  if (b.type === 'percentage') return `−${b.value} %`;
  if (b.type === 'fixed_amount') return `−${formatCurrency(b.value)}`;
  return '';
}

/**
 * Texto de la etiqueta: "CÓDIGO −5 %"; si hay una etiqueta distinta del código
 * va antes ("BLACK MONTH · EXTRA5 −5 %"). Nunca repite el código. Sin código
 * visible (showCode apagado) queda solo la etiqueta del cupón.
 */
export function couponBadgeText(b: ExclusiveBadge): string {
  if (!b.code) return b.label;
  const label = b.label.trim();
  const sameAsCode = label.toLowerCase() === b.code.toLowerCase();
  const head = label && !sameAsCode ? `${label} · ${b.code}` : b.code;
  return [head, valueText(b)].filter(Boolean).join(' ');
}

function useBadge(productId: string | number, variantId?: string | number | null): ExclusiveBadge | undefined {
  const { products, variations } = useExclusiveCoupons();
  return (variantId != null ? variations[String(variantId)] : undefined) ?? products[String(productId)];
}

interface CouponPhotoBadgeProps {
  productId: string | number;
  /** Id de la variante elegida (ficha). Sin él se usa el cupón del producto. */
  variantId?: string | number | null;
  /** En la ficha el badge copia el código al tocarlo. */
  copyable?: boolean;
}

const BASE =
  'inline-flex w-fit max-w-full items-center rounded-full border border-accent bg-bg px-2.5 py-1.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-accent-hover shadow-[0_4px_12px_-6px_rgba(27,25,25,0.25)]';

/**
 * Badge del cupón sobre la esquina superior izquierda de la foto (tarjetas y
 * galería de la ficha). Se renderiza dentro del contenedor de etiquetas.
 */
export function CouponPhotoBadge({ productId, variantId, copyable = false }: CouponPhotoBadgeProps) {
  const badge = useBadge(productId, variantId);
  if (!badge) return null;
  const text = couponBadgeText(badge);

  if (!copyable || !badge.code) {
    return <span className={BASE}>{text}</span>;
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(badge.code as string);
      sonnerResponse('Código copiado', 'success');
    } catch {
      sonnerResponse(`Tu código: ${badge.code}`, 'success');
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copiar código"
      aria-label={`${text}. Copiar código`}
      className={`${BASE} pointer-events-auto cursor-pointer transition-colors duration-200 hover:bg-gold-light`}
    >
      {text}
    </button>
  );
}

/** "Con EXTRA5, −5 % en compras desde $100" (ficha, bajo el precio). */
export function CouponMinNote({
  productId,
  variantId,
  className = '',
}: Omit<CouponPhotoBadgeProps, 'copyable'> & { className?: string }) {
  const badge = useBadge(productId, variantId);
  if (!badge || !badge.code || !badge.minOrderAmount) return null;
  const value = valueText(badge) || 'envío gratis';
  return (
    <p className={`font-body text-[13px] text-text-muted ${className}`}>
      Con <b className="font-semibold text-text">{badge.code}</b>, {value} en compras desde{' '}
      {formatCurrency(badge.minOrderAmount)}
    </p>
  );
}
