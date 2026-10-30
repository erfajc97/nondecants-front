import { useEffect, useRef, useState } from 'react';
import { comboTitle, comboSubtitle } from '@/app/helpers/comboLabels';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useCouponStore } from '@/app/store/coupon/couponStore';
import { lineCouponDiscount } from '@/app/helpers/couponItemDiscount';
import type { CartRow } from '../hooks/useCartPageHook';

interface CartDrawerLineProps {
  row: CartRow;
  group: 'immediate' | 'bajo';
  index: number;
  onSetTotal: (variantId: string, total: number) => void;
  onRemove: (variantId: string) => void;
}

/** Hace "saltar" un valor cuando cambia (no en el primer render). */
function useBump(value: number) {
  const prev = useRef(value);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setBump((b) => b + 1);
    }
  }, [value]);
  return bump;
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Línea del carrito lateral (prototipo): miniatura, nombre, formato, stepper,
 * precio y "Quitar". Misma lógica de stock/bajo pedido que CartLine.
 */
export default function CartDrawerLine({ row, group, index, onSetTotal, onRemove }: CartDrawerLineProps) {
  const { item, portionQty, total, split } = row;
  const isBajo = group === 'bajo';
  const isCombo = item.comboId != null;
  const [leaving, setLeaving] = useState(false);
  const bump = useBump(portionQty);

  const lineDiscount = useCouponStore((s) => (s.applied ? lineCouponDiscount(item, s.itemDiscounts ?? []) : 0));
  const portionDiscount = total > 0 ? (lineDiscount * portionQty) / total : 0;

  const decantCapped = item.stockAvailable == null && item.maxQty != null;
  const plusDisabled = decantCapped && total >= (item.maxQty ?? Infinity);
  const minusDisabled = group === 'immediate' && split;

  const variantLabel = isCombo
    ? comboSubtitle(item)
    : `${item.ml} ml · ${item.ml >= 30 ? 'Botella original' : 'Decant'}`;

  const gone = (fn: () => void) => {
    if (reducedMotion()) return fn();
    setLeaving(true);
    setTimeout(fn, 300);
  };

  const handleRemove = () =>
    gone(() => (isBajo && split ? onSetTotal(item.variantId, total - portionQty) : onRemove(item.variantId)));

  const handleMinus = () => {
    if (minusDisabled) return;
    if (total - 1 < 1) gone(() => onRemove(item.variantId));
    else onSetTotal(item.variantId, total - 1);
  };

  const btn =
    'flex h-[34px] w-[34px] items-center justify-center text-[17px] text-text transition-colors hover:bg-bg-alt disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <div
      style={{ ['--i' as string]: Math.min(index, 8) }}
      className={`${leaving ? 'nd-gone' : 'nd-rise'} grid grid-cols-[72px_minmax(0,1fr)_auto] gap-3.5 border-b border-border py-4`}
    >
      <div className="h-[72px] w-[72px] overflow-hidden rounded-[3px] border border-border bg-bg">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className={`h-full w-full ${isCombo ? 'object-cover' : 'object-contain p-1.5'}`}
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="line-clamp-2 font-display text-[17px] leading-[1.15] text-text">{isCombo ? comboTitle(item) : item.name}</p>
        <p className="mt-[3px] font-body text-[13px] text-text-muted">{variantLabel}</p>
        {isBajo && (
          <span className="mt-1.5 inline-flex items-center rounded-full bg-warning-muted px-2 py-0.5 font-body text-[11.5px] font-semibold text-warning">
            Por encargo · 13–17 días
          </span>
        )}
        {split && !isBajo && (
          <p className="mt-1 font-body text-[12.5px] font-semibold text-warning">El resto va por encargo ↓</p>
        )}
        <div className="mt-2 inline-flex items-center rounded-[3px] border border-border">
          <button onClick={handleMinus} disabled={minusDisabled} className={btn} aria-label={`Una unidad menos de ${item.name}`}>
            −
          </button>
          <span className="min-w-6 select-none text-center font-body text-sm tabular-nums text-text" aria-live="polite">
            {portionQty}
          </span>
          <button
            onClick={() => !plusDisabled && onSetTotal(item.variantId, total + 1)}
            disabled={plusDisabled}
            className={btn}
            aria-label={`Una unidad más de ${item.name}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="text-right font-body">
        <p key={bump} className={`text-[15px] font-bold tabular-nums text-text ${bump ? 'nd-bump' : ''}`}>
          {formatCurrency(item.price * portionQty)}
        </p>
        {portionDiscount > 0 && (
          <p className="mt-0.5 text-[12.5px] font-semibold text-success">Cupón −{formatCurrency(portionDiscount)}</p>
        )}
        <button
          onClick={handleRemove}
          className="ml-auto mt-2 block text-[12.5px] text-text-muted underline underline-offset-2 transition-colors hover:text-text"
          aria-label={`Quitar ${item.name} del carrito`}
        >
          {isBajo && split ? 'Quitar encargo' : 'Quitar'}
        </button>
      </div>
    </div>
  );
}
