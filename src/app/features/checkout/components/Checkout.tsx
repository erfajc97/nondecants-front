import AppProviders from '@/app/providers/AppProviders';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import { useCheckoutHook, type BackorderLine } from '../hooks/useCheckoutHook';
import CheckoutForm from './CheckoutForm';
import CheckoutOrderSummary from './CheckoutOrderSummary';

function CheckoutContent() {
  const checkoutData = useCheckoutHook();

  return (
    <div className="relative grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-md border border-border bg-surface p-5 md:p-8">
        <CheckoutForm {...checkoutData} onLogin={checkoutData.openAuth} />
      </div>
      <div className="min-w-0 rounded-md border border-border bg-surface p-5 md:p-6 lg:sticky lg:top-6">
        <CheckoutOrderSummary
          items={checkoutData.items}
          subtotal={checkoutData.subtotal}
          deliveryCost={checkoutData.deliveryCost}
          total={checkoutData.total}
          payphoneSurcharge={checkoutData.payphoneSurcharge}
          couponCode={checkoutData.couponCode}
          couponDiscount={checkoutData.couponDiscount}
          couponFreeShipping={checkoutData.couponFreeShipping}
          couponApplied={checkoutData.couponApplied}
          couponLoading={checkoutData.couponLoading}
          couponMessage={checkoutData.couponMessage}
          onCouponCodeChange={checkoutData.setCouponCode}
          onApplyCoupon={checkoutData.handleApplyCoupon}
          onRemoveCoupon={checkoutData.handleRemoveCoupon}
        />
      </div>

      {/* Registro/inicio de sesión sin salir del checkout (compra guest) */}
      <AuthModalIsland open={checkoutData.authOpen} onClose={checkoutData.closeAuth} />

      {checkoutData.bajoConfirmOpen && (
        <BajoPedidoConfirmModal
          isPending={checkoutData.isPending}
          items={checkoutData.backorderItems}
          onConfirm={checkoutData.confirmBajoPedido}
          onCancel={checkoutData.cancelBajoPedido}
        />
      )}
    </div>
  );
}

function BajoPedidoConfirmModal({
  isPending,
  items,
  onConfirm,
  onCancel,
}: {
  isPending: boolean;
  items: BackorderLine[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // ¿Hay al menos un frasco con stock parcial (algo inmediato + algo bajo pedido)?
  const hasPartial = items.some((i) => i.inStock > 0 && i.bajo > 0);

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-text/50" onClick={isPending ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-surface p-6 shadow-xl md:p-7">
        <div className="mb-5 flex items-start gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 shrink-0 text-warning">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="mb-1.5 font-body text-[13px] font-semibold text-warning">Pedido bajo demanda</p>
            <h3 className="font-display text-2xl leading-tight text-text">
              {hasPartial ? 'Stock parcial disponible' : '¿Confirmas tu pedido?'}
            </h3>
          </div>
        </div>

        <p className="mb-4 font-body text-sm leading-relaxed text-text-soft">
          {hasPartial
            ? 'Algunas unidades salen de stock de inmediato y el resto se importa bajo pedido:'
            : 'Tu pedido incluye productos bajo pedido que importamos especialmente para ti:'}
        </p>

        {/* Desglose por producto */}
        <div className="mb-5 divide-y divide-border rounded-md border border-border">
          {items.map((it, idx) => (
            <div key={idx} className="flex flex-col gap-1 px-4 py-3">
              <p className="font-body text-sm text-text">
                {it.name}
                {it.ml ? <span className="text-text-muted"> · {it.ml}ml</span> : null}
              </p>
              <p className="font-body text-xs text-text-soft">
                {it.inStock > 0 && (
                  <span className="text-text">
                    {it.inStock} en stock
                  </span>
                )}
                {it.inStock > 0 && it.bajo > 0 && <span className="text-text-muted"> · </span>}
                {it.bajo > 0 && (
                  <span className="font-semibold text-warning">
                    {it.bajo} bajo pedido
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-md bg-gold-light px-4 py-3">
          <p className="font-body text-sm leading-relaxed text-text-soft">
            Las unidades bajo pedido llegan en <span className="text-text">13 a 17 días</span> tras confirmar el pago. El resto se prepara de inmediato. Se cobra el total ahora y generamos tu orden.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-[54px] flex-1 rounded-sm bg-text px-6 font-body text-[15px] font-semibold text-bg transition-colors hover:bg-text-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Procesando…' : 'Sí, confirmar pedido'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="h-[54px] flex-1 rounded-sm border-[1.5px] border-text px-6 font-body text-[15px] font-semibold text-text transition-colors hover:bg-bg-alt disabled:cursor-not-allowed disabled:opacity-50"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <AppProviders withToaster>
      <CheckoutContent />
    </AppProviders>
  );
}
