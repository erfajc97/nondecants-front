import { formatCurrency } from '@/app/helpers/formatCurrency';
import DeliveryEta from '@/app/components/UI/DeliveryEta';
import { DEFAULT_DISPATCH_CUTOFF_HOUR } from '@/app/helpers/deliveryWindow';
import { useCouponStore } from '@/app/store/coupon/couponStore';
import { lineCouponDiscount } from '@/app/helpers/couponItemDiscount';
import type { CartRow } from '../hooks/useCartPageHook';

interface CartLineProps {
  row: CartRow;
  group: 'immediate' | 'bajo';
  deliveryOffset?: number;
  cutoffHour?: number;
  /** Fija la cantidad TOTAL del item (el split se recalcula solo). */
  onSetTotal: (variantId: string, total: number) => void;
  onRemove: (variantId: string) => void;
}

export default function CartLine({ row, group, deliveryOffset = 0, cutoffHour = DEFAULT_DISPATCH_CUTOFF_HOUR, onSetTotal, onRemove }: CartLineProps) {
  const { item, portionQty, total, split } = row;
  const isBajo = group === 'bajo';
  const isCombo = item.comboId != null;
  // Cupón aplicado: descuento de esta línea (proporcional a la porción mostrada).
  const lineDiscount = useCouponStore((s) =>
    s.applied ? lineCouponDiscount(item, s.itemDiscounts ?? []) : 0,
  );
  const portionDiscount = total > 0 ? (lineDiscount * portionQty) / total : 0;

  // Decant topado por los ml del producto: nunca se piden más unidades que las
  // que da el inventario (si los frascos del carrito ya ocuparon esos ml, la
  // porción sobrante se muestra como bajo pedido, no se puede subir más).
  const decantCapped = item.stockAvailable == null && item.maxQty != null;
  const plusDisabled = decantCapped && total >= (item.maxQty ?? Infinity);
  // En la fila "en stock" de un item partido, el menos se gestiona desde la
  // fila de bajo pedido (evita ambigüedad sobre qué unidad se quita).
  const minusDisabled = group === 'immediate' && split;

  const variantLabel = isCombo
    ? `Combo · ${item.comboProducts?.length ?? 0} productos`
    : `${item.ml} ml · ${item.ml >= 30 ? 'Botella original' : 'Decant'}`;

  // Quitar: en la porción bajo pedido de un item partido, solo elimina esa
  // porción (baja el total al stock); en el resto, elimina el item completo.
  const handleRemove = () =>
    isBajo && split ? onSetTotal(item.variantId, total - portionQty) : onRemove(item.variantId);

  return (
    <div
      className={`grid grid-cols-[72px_minmax(0,1fr)] gap-x-3.5 gap-y-3 border-b border-border py-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center sm:gap-x-5 sm:py-5 ${
        isBajo ? 'border-l-[3px] border-l-warning pl-3 sm:pl-4' : ''
      }`}
    >
      {/* Imagen */}
      <div className="row-span-2 h-[72px] w-[72px] shrink-0 overflow-hidden rounded-sm border border-border bg-surface sm:row-span-1 sm:h-24 sm:w-24">
        {item.image ? (
          <img src={item.image} alt={item.name} className={`h-full w-full ${isCombo ? 'object-cover' : 'object-contain p-1.5'}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <h3 className="line-clamp-2 font-display text-[17px] leading-[1.15] text-text sm:text-xl">
          {item.name}
        </h3>
        <p className="mt-1 font-body text-[13px] text-text-muted">{variantLabel}</p>

        <div className="mt-2.5 min-w-0 overflow-hidden">
          <DeliveryEta
            variant={isBajo ? 'backorder' : 'immediate'}
            offsetDays={deliveryOffset}
            cutoffHour={cutoffHour}
            compact
          />
        </div>
        {split && !isBajo && (
          <p className="mt-1 font-body text-[13px] font-semibold text-warning">
            El resto va bajo pedido ↓
          </p>
        )}

        <button
          onClick={handleRemove}
          className="mt-2.5 font-body text-[12.5px] text-text-muted underline underline-offset-2 transition-colors hover:text-text"
        >
          {isBajo && split ? 'Quitar bajo pedido' : 'Quitar'}
        </button>
      </div>

      {/* Stepper + precio */}
      <div className="col-start-2 flex items-center justify-between gap-5 sm:col-start-3 sm:flex-col sm:items-end sm:justify-center">
        {isCombo ? (
          <span className="select-none font-body text-sm text-text-muted">Cant: {portionQty}</span>
        ) : (
          <div className="inline-flex items-center rounded-sm border border-border">
            <button
              onClick={() => !minusDisabled && onSetTotal(item.variantId, total - 1)}
              disabled={minusDisabled}
              className="flex h-[34px] w-[34px] items-center justify-center text-[17px] text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Disminuir"
            >
              −
            </button>
            <span className="flex h-[34px] min-w-7 select-none items-center justify-center font-body text-sm tabular-nums text-text">
              {portionQty}
            </span>
            <button
              onClick={() => !plusDisabled && onSetTotal(item.variantId, total + 1)}
              disabled={plusDisabled}
              className="flex h-[34px] w-[34px] items-center justify-center text-[17px] text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Aumentar"
            >
              +
            </button>
          </div>
        )}
        <p className="font-body text-[15px] font-bold tabular-nums text-text">{formatCurrency(item.price * portionQty)}</p>
        {portionDiscount > 0 && (
          <p className="font-body text-[13px] font-semibold text-success">Cupón −{formatCurrency(portionDiscount)}</p>
        )}
      </div>
    </div>
  );
}
