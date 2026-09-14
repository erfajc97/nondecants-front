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
      <p className="eyebrow mb-3">Cupón de descuento</p>
      {couponApplied ? (
        <div className="flex items-center justify-between border-l-2 border-success bg-bg-alt px-4 py-3">
          <div>
            <span className="font-body text-sm tracking-[0.08em] text-text">{couponCode}</span>
            <span className="ml-2 font-body text-xs text-success">
              {couponFreeShipping ? 'Envío gratis' : `-${formatCurrency(couponDiscount)}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="font-body text-[11px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-error"
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
            className="min-w-0 flex-1 border border-border bg-transparent px-4 py-3 font-body text-sm uppercase tracking-[0.08em] text-text placeholder:text-text-muted focus:border-text focus:outline-none"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponLoading || !couponCode.trim()}
            className="bg-text px-6 py-3 font-body text-[11px] uppercase tracking-[0.16em] text-bg transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {couponLoading ? '...' : 'Aplicar'}
          </button>
        </div>
      )}
      {couponMessage && !couponApplied && (
        <p className="mt-1.5 font-body text-xs text-error">{couponMessage}</p>
      )}
    </div>
  );
}
