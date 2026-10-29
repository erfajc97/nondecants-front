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
  remainingForFreeShipping?: number;
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
      <div className="rounded-md border border-border bg-surface">
        <h2 className="border-b border-border px-5 py-4 font-body! text-xl font-bold text-text">Resumen</h2>

        <div className="px-5 pt-5">
          <FreeShippingBar
            subtotal={afterDiscount}
            threshold={freeShippingThreshold}
            unlocked={qualifiesFreeShipping}
          />
        </div>

        <div className="flex flex-col gap-2.5 px-5 font-body text-[15px]">
          {immediateCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-soft">Subtotal · en stock</span>
              <span className="tabular-nums text-text">{formatCurrency(immediateSubtotal)}</span>
            </div>
          )}
          {bajoCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-warning">Subtotal · bajo pedido</span>
              <span className="tabular-nums text-text">{formatCurrency(bajoSubtotal)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-soft">Cupón</span>
              <span className="tabular-nums text-success">-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Envío estimado · Servientrega</span>
            <span className={`tabular-nums ${qualifiesFreeShipping ? 'font-semibold text-success' : 'text-text-muted'}`}>
              {qualifiesFreeShipping ? 'Gratis' : formatCurrency(shipping)}
            </span>
          </div>
        </div>

        <div className="mx-5 mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-body text-lg font-bold text-text">Total</span>
          <span className="font-body text-xl font-bold tabular-nums text-text">{formatCurrency(total)}</span>
        </div>
        <p className="mt-1.5 px-5 font-body text-[13px] text-text-muted">
          El envío y el recargo por tarjeta se confirman en el pago.
        </p>

        {coupon.hasNonComboItems && (
          <div className="mt-5 px-5">
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

        <div className="px-5 pt-5">
          <a
            href="/checkout"
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft"
          >
            <span>Ir a pagar · {formatCurrency(total)}</span>
            <span aria-hidden="true">→</span>
          </a>
          <a
            href="/catalogo/perfumes"
            className="mt-3 block text-center font-body text-[13px] font-semibold text-text-muted underline underline-offset-4 transition-colors hover:text-text"
          >
            Seguir comprando
          </a>
        </div>

        <div className="mt-5 px-5">
          <PaymentMethodIcons />
        </div>

        <div className="mt-5 border-t border-border px-5 py-5">
          <TrustIcons />
        </div>
      </div>
    </div>
  );
}
