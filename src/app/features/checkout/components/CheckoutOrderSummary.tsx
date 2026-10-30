import { DEMO_ENABLED } from '@/app/lib/mock';
import { comboTitle, comboSubtitle } from '@/app/helpers/comboLabels';
import CouponField from './CouponField';
import TermsAcceptance from './TermsAcceptance';
import Loader from '@/app/components/Loader';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useCouponStore } from '@/app/store/coupon/couponStore';
import { lineCouponDiscount } from '@/app/helpers/couponItemDiscount';
import { useCartStore, type CartItem } from '@/app/store/cart/cartStore';
import { splitCartStock, getSplit } from '@/app/helpers/cartStockSplit';
import { lineDeliveryLabel, orderDeliveryLabel, DEFAULT_DISPATCH_CUTOFF_HOUR } from '@/app/helpers/deliveryWindow';
import { useDeliveryOffsetQuery, useDispatchCutoffQuery } from '@/app/tanstack-queries/settingsQuery';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
  couponFreeShipping?: boolean;
  couponApplied?: boolean;
  couponLoading?: boolean;
  couponMessage?: string;
  onCouponCodeChange?: (code: string) => void;
  onApplyCoupon?: () => void | Promise<unknown>;
  onRemoveCoupon?: () => void;
  payphoneSurcharge?: number;
  /** El envío ya se puede calcular (ciudad o punto de retiro elegido en el paso 1). */
  shippingReady?: boolean;
  /** Mostrar la casilla de términos (solo en el paso 3). */
  showTerms?: boolean;
  termsAccepted?: boolean;
  onTermsChange?: (accepted: boolean) => void;
  canConfirm?: boolean;
  onConfirm?: () => void;
  isPending?: boolean;
  /** Qué falta para poder confirmar (se muestra bajo el botón deshabilitado). */
  missingText?: string;
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  deliveryCost,
  total,
  couponCode = '',
  couponDiscount = 0,
  couponFreeShipping = false,
  couponApplied = false,
  couponLoading = false,
  couponMessage = '',
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  payphoneSurcharge = 0,
  shippingReady = true,
  showTerms = false,
  termsAccepted = false,
  onTermsChange,
  canConfirm = false,
  onConfirm,
  isPending = false,
  missingText = '',
}: CheckoutOrderSummaryProps) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const lineCouponApplied = useCouponStore((s) => s.applied);
  const storedItemDiscounts = useCouponStore((s) => s.itemDiscounts);
  const itemDiscounts = lineCouponApplied ? storedItemDiscounts ?? [] : [];

  const hasNonComboItems = items.some((item) => item.comboId == null);

  // Incluye lo que pasa a bajo pedido por reparto de inventario (frascos que
  // consumen los ml de los decants del mismo producto), no solo el flag.
  const splits = splitCartStock(items);
  const hasBajoPedido = items.some((item) => getSplit(splits, item).bajo > 0);

  const { data: deliveryOffset = 0 } = useDeliveryOffsetQuery();
  const { data: cutoffHour = DEFAULT_DISPATCH_CUTOFF_HOUR } = useDispatchCutoffQuery();

  return (
    <div className="flex flex-col">
      <h2 className="mb-4 border-b border-border pb-4 font-display text-[26px] font-normal leading-none text-text">Tu pedido</h2>

      {hasBajoPedido && (
        <div className="mb-5 flex items-start gap-2.5 rounded-md bg-gold-light px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-warning">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm leading-snug text-text-soft">
            Tu pedido incluye productos <span className="font-semibold text-warning">bajo pedido</span>. Plazo: 13–17 días tras confirmación del pago.
          </p>
        </div>
      )}

      {/* Cart Items */}
      <div className="mb-6 flex flex-1 flex-col divide-y divide-border">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">No hay productos en tu carrito.</p>
        ) : (
          items.map((item) => (
            <div key={item.variantId} className="flex items-start gap-3.5 py-4 first:pt-0">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface">
                <img src={item.image} alt={item.name} className={`h-full w-full ${item.comboId ? 'object-cover' : 'object-contain p-1.5'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="pr-4 font-display text-[17px] leading-tight text-text">{item.comboId ? comboTitle(item) : item.name}</h3>
                  <button onClick={() => removeItem(item.variantId)} className="text-text-muted hover:text-error transition-colors" aria-label="Eliminar producto">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                {item.comboId ? (
                  <p className="mt-1 font-body text-[13px] text-text-muted">
                    {comboSubtitle(item)}
                  </p>
                ) : (
                  <p className="mt-1 font-body text-[13px] text-text-muted">
                    {item.ml}ml · {item.ml >= 30 ? 'Botella original' : 'Decant'}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-sm border border-border">
                    <button type="button" aria-label="Disminuir" onClick={() => updateQty(item.variantId, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center text-lg text-text-muted transition-colors hover:text-text">−</button>
                    <span className="flex h-9 min-w-7 select-none items-center justify-center font-body text-sm tabular-nums text-text">{item.quantity}</span>
                    <button type="button" aria-label="Aumentar" disabled={item.maxQty != null && item.quantity >= item.maxQty} onClick={() => updateQty(item.variantId, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-lg text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40">+</button>
                  </div>
                  <p className="font-body text-[15px] font-bold tabular-nums text-text">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                {lineCouponDiscount(item, itemDiscounts) > 0 && (
                  <p className="mt-1 text-right font-body text-[13px] font-semibold text-success">
                    Cupón −{formatCurrency(lineCouponDiscount(item, itemDiscounts))}
                  </p>
                )}

                {/* Cuándo llega esta línea */}
                <p className="mt-2 flex items-center gap-1.5 font-body text-[13px] text-text-soft">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      getSplit(splits, item).bajo > 0 ? 'bg-warning' : 'bg-success'
                    }`}
                  />
                  {lineDeliveryLabel(getSplit(splits, item), deliveryOffset, cutoffHour)}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Resumen global de tiempos de entrega */}
        {items.length > 0 && (
          <p className="pt-4 font-body text-sm leading-relaxed text-text-soft">
            {orderDeliveryLabel(items.map((i) => getSplit(splits, i)), deliveryOffset, cutoffHour)}
          </p>
        )}
      </div>

      {onApplyCoupon && (DEMO_ENABLED || hasNonComboItems) && (
        <div className="mb-6">
          <CouponField
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            couponFreeShipping={couponFreeShipping}
            couponApplied={couponApplied}
            couponLoading={couponLoading}
            couponMessage={couponMessage}
            onCouponCodeChange={onCouponCodeChange ?? (() => {})}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon ?? (() => {})}
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5 border-t border-border pt-4 font-body text-[15px]">
        <div className="flex items-center justify-between text-text">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span>Descuento cupón</span>
            <span className="tabular-nums">-{formatCurrency(couponDiscount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-text">
          <span>Envío</span>
          {shippingReady ? (
            <span className="tabular-nums">
              {couponFreeShipping ? 'Gratis' : deliveryCost === 0 ? 'Gratis' : formatCurrency(deliveryCost)}
            </span>
          ) : (
            <span className="text-text-muted">Se calcula en el paso 1</span>
          )}
        </div>

        {payphoneSurcharge > 0 && (
          <div className="flex items-center justify-between text-text-muted">
            <span>Recargo de tarjeta (6%)</span>
            <span className="tabular-nums">{formatCurrency(payphoneSurcharge)}</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-border pt-4 text-text">
          <span className="font-body text-lg font-bold">Total</span>
          <span key={total} className="ck-total font-display text-[26px] font-normal leading-none tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {onConfirm && (
        <div className="mt-5 flex flex-col gap-4">
          {showTerms && <TermsAcceptance checked={termsAccepted} onChange={onTermsChange ?? (() => {})} />}
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isPending}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-text px-6 font-body text-[15px] font-semibold text-bg transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted"
          >
            {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : `Confirmar pedido · ${formatCurrency(total)}`}
          </button>
          {!canConfirm && missingText && (
            <p className="text-center font-body text-[13.5px] leading-snug text-text-muted">{missingText}</p>
          )}
        </div>
      )}
    </div>
  );
}
