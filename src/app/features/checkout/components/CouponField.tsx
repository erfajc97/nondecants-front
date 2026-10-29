import { formatCurrency } from '@/app/helpers/formatCurrency';

interface CouponFieldProps {
  couponCode: string;
  couponDiscount: number;
  couponFreeShipping: boolean;
  couponApplied: boolean;
  couponLoading: boolean;
  couponMessage: string;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

export default function CouponField({
  couponCode,
  couponDiscount,
  couponFreeShipping,
  couponApplied,
  couponLoading,
  couponMessage,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponFieldProps) {
  return (
    <div>
      <p className="mb-2 font-body text-[15px] font-semibold text-text">Cupón de descuento</p>
      {couponApplied ? (
        <div className="flex items-center justify-between rounded-md bg-gold-light px-4 py-3">
          <div>
            <span className="font-body text-[15px] font-semibold tracking-[0.08em] text-text">{couponCode}</span>
            <span className="ml-2 font-body text-sm font-semibold text-success">
              {couponFreeShipping ? 'Envío gratis' : `-${formatCurrency(couponDiscount)}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="font-body text-sm text-text-muted underline underline-offset-2 transition-colors hover:text-error"
          >
            Quitar
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            id="coupon-code"
            type="text"
            maxLength={40}
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            placeholder="Ej: VERANO2026"
            className="h-12 min-w-0 flex-1 rounded-md border-2 border-border bg-surface px-3 font-body text-base uppercase tracking-[0.08em] text-text placeholder:text-text-muted focus:border-text focus:outline-none"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponLoading || !couponCode.trim()}
            className="h-12 rounded-md border-2 border-text px-4 font-body text-[15px] font-semibold text-text transition-colors hover:bg-text hover:text-bg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text"
          >
            {couponLoading ? '...' : 'Aplicar'}
          </button>
        </div>
      )}
      {couponMessage && !couponApplied && (
        <p className="mt-1.5 font-body text-sm font-semibold text-error">{couponMessage}</p>
      )}
    </div>
  );
}
