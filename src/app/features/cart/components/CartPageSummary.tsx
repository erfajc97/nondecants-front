import { formatCurrency } from '@/app/helpers/formatCurrency';
import PaymentMethodIcons from '@/app/components/PaymentMethodIcons';
import TrustIcons from '@/app/components/UI/TrustIcons';
import CouponField from '@/app/features/checkout/components/CouponField';
import { useCouponHook } from '@/app/features/checkout/hooks/useCouponHook';
import FreeShippingBar from './FreeShippingBar';

interface CartPageSummaryProps {
  immediateSubtotal: number;
  bajoSubtotal: number;
  shipping: number;
  total: number;
  immediateCount: number;
  bajoCount: number;
  afterDiscount: number;
  couponDiscount: number;
  freeShippingThreshold: number;
  qualifiesFreeShipping: boolean;
  remainingForFreeShipping: number;
}

export default function CartPageSummary({
  immediateSubtotal,
  bajoSubtotal,
  shipping,
  total,
  immediateCount,
  bajoCount,
  afterDiscount,
  couponDiscount,
  freeShippingThreshold,
  qualifiesFreeShipping,
}: CartPageSummaryProps) {
  const coupon = useCouponHook();

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-bg-alt p-7 md:p-8">
        <span className="eyebrow">— Resumen</span>

        <div className="mt-6">
          <FreeShippingBar
            subtotal={afterDiscount}
            threshold={freeShippingThreshold}
            unlocked={qualifiesFreeShipping}
          />
        </div>

        <div className="flex flex-col gap-3 font-body text-sm">
          {immediateCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-soft">Subtotal — en stock</span>
              <span className="text-text">{formatCurrency(immediateSubtotal)}</span>
            </div>
          )}
          {bajoCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="italic text-text-soft">Subtotal — bajo pedido</span>
              <span className="text-text">{formatCurrency(bajoSubtotal)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-soft">Cupón</span>
              <span className="text-success">-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Envío estimado · Servientrega</span>
            <span className={qualifiesFreeShipping ? 'text-success' : 'text-text-muted'}>
              {qualifiesFreeShipping ? 'GRATIS' : formatCurrency(shipping)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
          <span className="font-body text-[11px] uppercase tracking-[0.18em] text-text">Total</span>
          <span className="font-display text-3xl font-light text-text">{formatCurrency(total)}</span>
        </div>
        <p className="mt-2 font-display text-sm italic text-text-muted">
          Envío e impuestos finales se confirman en el pago.
        </p>

        {coupon.hasNonComboItems && (
          <div className="mt-6">
            <CouponField
              couponCode={coupon.couponCode}
              couponDiscount={coupon.couponDiscount}
              couponFreeShipping={coupon.couponFreeShipping}
              couponApplied={coupon.couponApplied}
              couponLoading={coupon.couponLoading}
              couponMessage={coupon.couponMessage}
              onCouponCodeChange={coupon.setCouponCode}
              onApplyCoupon={coupon.handleApplyCoupon}
              onRemoveCoupon={coupon.handleRemoveCoupon}
            />
          </div>
        )}

        <a
          href="/checkout"
          className="gold-frame mt-6 flex w-full items-center justify-between gap-2 bg-text px-6 py-4 font-body text-xs font-medium uppercase tracking-[0.2em] text-bg transition-colors hover:bg-accent"
        >
          <span>Pagar — {formatCurrency(total)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12h14M14 6l6 6-6 6" /></svg>
        </a>

        <div className="mt-6">
          <PaymentMethodIcons />
        </div>

        <div className="mt-6">
          <TrustIcons />
        </div>
      </div>
    </div>
  );
}
