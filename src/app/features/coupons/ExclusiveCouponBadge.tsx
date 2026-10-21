import { useExclusiveCoupons } from './useExclusiveCoupons';

interface ExclusiveCouponBadgeProps {
  productId: string | number;
  /** Id de la variante elegida (PDP). Sin él se usa el cupón del producto. */
  variantId?: string | number | null;
  className?: string;
}

/** Etiqueta "Cupón exclusivo" / "Liquidación" (REQ-10). Con showCode muestra el código. */
export default function ExclusiveCouponBadge({ productId, variantId, className = '' }: ExclusiveCouponBadgeProps) {
  const { products, variations } = useExclusiveCoupons();
  const badge =
    (variantId != null ? variations[String(variantId)] : undefined) ?? products[String(productId)];
  if (!badge) return null;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 border border-accent bg-bg px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.14em] text-accent ${className}`}
    >
      {badge.label}
      {badge.code && <span className="text-text">· {badge.code}</span>}
    </span>
  );
}
