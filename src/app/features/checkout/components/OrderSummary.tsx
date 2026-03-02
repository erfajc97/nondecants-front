import { formatCurrency } from '@/app/helpers/formatCurrency';
import PayphoneSurchargeNotice from './PayphoneSurchargeNotice';
import type { CartItem } from '@/app/store/cart/cartStore';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  payphoneSurcharge: number;
  isPayphone: boolean;
  total: number;
  onSubmit: () => void;
  isPending: boolean;
}

export default function OrderSummary({
  items,
  subtotal,
  deliveryCost,
  payphoneSurcharge,
  isPayphone,
  total,
  onSubmit,
  isPending,
}: OrderSummaryProps) {
  return (
    <div className="bg-[--color-surface] border border-[--color-border] p-6 space-y-5 sticky top-20" style={{ borderRadius: 'var(--radius-md)' }}>
      <h2 className="font-heading text-base uppercase tracking-wider text-[--color-text]">
        Resumen del pedido
      </h2>

      {/* Items */}
      <div className="space-y-3 border-b border-[--color-border] pb-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex justify-between text-sm">
            <span className="text-[--color-text-muted] truncate mr-2">
              {item.name} · {item.ml}ml × {item.quantity}
            </span>
            <span className="text-[--color-text] shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[--color-text-muted]">Subtotal</span>
          <span className="text-[--color-text]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[--color-text-muted]">Envío</span>
          <span className={deliveryCost === 0 ? 'text-[--color-success]' : 'text-[--color-text]'}>
            {deliveryCost === 0 ? 'GRATIS' : formatCurrency(deliveryCost)}
          </span>
        </div>
        {isPayphone && payphoneSurcharge > 0 && (
          <div className="flex justify-between">
            <span className="text-[--color-text-muted]">Recargo Payphone (6%)</span>
            <span className="text-[--color-accent]">+{formatCurrency(payphoneSurcharge)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-[--color-border] pt-4 flex justify-between items-center">
        <span className="font-heading text-sm uppercase tracking-wider text-[--color-text]">Total</span>
        <span className="font-heading text-2xl text-[--color-accent]">{formatCurrency(total)}</span>
      </div>

      {/* Aviso Payphone */}
      {isPayphone && payphoneSurcharge > 0 && (
        <PayphoneSurchargeNotice surcharge={payphoneSurcharge} />
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={isPending}
        className="w-full py-4 bg-[--color-accent] text-[--color-bg] font-heading uppercase tracking-widest text-sm hover:bg-[--color-accent-hover] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        {isPending ? 'Procesando...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}
