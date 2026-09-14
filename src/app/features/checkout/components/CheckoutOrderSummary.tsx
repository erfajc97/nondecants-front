import CouponField from './CouponField';
import { formatCurrency } from '@/app/helpers/formatCurrency';
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
  onApplyCoupon?: () => void;
  onRemoveCoupon?: () => void;
  payphoneSurcharge?: number;
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
}: CheckoutOrderSummaryProps) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);

  const hasNonComboItems = items.some((item) => item.comboId == null);

  // Incluye lo que pasa a bajo pedido por reparto de inventario (frascos que
  // consumen los ml de los decants del mismo producto), no solo el flag.
  const splits = splitCartStock(items);
  const hasBajoPedido = items.some((item) => getSplit(splits, item).bajo > 0);

  const { data: deliveryOffset = 0 } = useDeliveryOffsetQuery();
  const { data: cutoffHour = DEFAULT_DISPATCH_CUTOFF_HOUR } = useDispatchCutoffQuery();

  return (
    <div className="flex flex-col">
      <h2 className="mb-6 font-display text-3xl font-light text-text">Tu pedido</h2>

      {hasBajoPedido && (
        <div className="mb-5 flex items-start gap-2 border-l-2 border-accent bg-bg-alt px-3 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-accent">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs leading-snug text-text-soft">
            Tu pedido incluye productos <span className="text-text">bajo pedido</span>. Plazo: 13–17 días tras confirmación del pago.
          </p>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex flex-col gap-5 mb-8 flex-1">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">No hay productos en tu carrito.</p>
        ) : (
          items.map((item) => (
            <div key={item.variantId} className="flex gap-4 items-center">
              <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-bg-alt">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="pr-4 font-display text-base font-light leading-snug text-text">{item.name}</h3>
                  <button onClick={() => removeItem(item.variantId)} className="text-text-muted hover:text-error transition-colors" aria-label="Eliminar producto">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                {item.comboId ? (
                  <div className="mt-1.5 inline-block border border-border px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    Combo · {item.comboProducts?.length ?? 0} productos
                  </div>
                ) : (
                  <div className="mt-1.5 inline-block border border-border px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {item.ml}ml {item.ml >= 30 ? 'Botella original' : 'Decant'}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  {item.comboId ? (
                    <span className="select-none font-body text-sm text-text">Cant: {item.quantity}</span>
                  ) : (
                    <div className="flex items-center">
                      <button type="button" onClick={() => updateQty(item.variantId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center border border-border text-text-muted transition-colors hover:text-text">−</button>
                      <span className="flex h-7 w-8 select-none items-center justify-center border-y border-border font-body text-sm text-text">{item.quantity}</span>
                      <button type="button" disabled={item.maxQty != null && item.quantity >= item.maxQty} onClick={() => updateQty(item.variantId, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center border border-border text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40">+</button>
                    </div>
                  )}
                  <p className="font-body text-sm text-text">{formatCurrency(item.price * item.quantity)}</p>
                </div>

                {/* Cuándo llega esta línea */}
                <p className="mt-2 flex items-center gap-1.5 font-body text-[11px] text-text-soft">
                  <span
                    className={`h-[5px] w-[5px] shrink-0 rounded-full ${
                      getSplit(splits, item).bajo > 0 ? 'bg-accent' : 'bg-text-muted'
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
          <p className="border-t border-border pt-4 font-body text-[12px] leading-relaxed text-text-soft">
            {orderDeliveryLabel(items.map((i) => getSplit(splits, i)), deliveryOffset, cutoffHour)}
          </p>
        )}
      </div>

      {onApplyCoupon && hasNonComboItems && (
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

      <div className="flex flex-col gap-4 font-body text-sm">
        <div className="h-px w-full bg-border" />

        <div className="flex justify-between items-center text-text">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between items-center text-success">
            <span>Descuento cupón</span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-text">
          <span>{couponFreeShipping ? 'Envío (gratis)' : 'Envío'}</span>
          <span>{couponFreeShipping ? formatCurrency(0) : formatCurrency(deliveryCost)}</span>
        </div>

        {payphoneSurcharge > 0 && (
          <div className="flex justify-between items-center text-text-muted">
            <span>Recargo Payphone (6%)</span>
            <span>{formatCurrency(payphoneSurcharge)}</span>
          </div>
        )}

        <div className="mt-2 h-px w-full bg-border" />

        <div className="mt-2 flex items-center justify-between text-text">
          <span className="font-body text-[11px] uppercase tracking-[0.18em] text-text-muted">Total</span>
          <span className="font-display text-2xl font-light">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
