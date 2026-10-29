import AppProviders from '@/app/providers/AppProviders';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import OrderPlaced from '@/app/features/order/components/OrderPlaced';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useCheckoutHook, type BackorderLine } from '../hooks/useCheckoutHook';
import CheckoutForm from './CheckoutForm';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import '../checkout.css';

const WA_PHONE = '+593 99 230 5463';
const WA_URL = 'https://wa.me/593992305463';

function CheckoutContent() {
  const c = useCheckoutHook();

  if (c.placed) {
    return (
      <OrderPlaced
        orderNumber={c.placed.orderNumber}
        email={c.placed.email}
        total={c.placed.total}
        transfer={c.placed.method === 'TRANSFERENCIA'}
        demo
      />
    );
  }

  // Barra inferior móvil: "Continuar" en los pasos 1 y 2, "Confirmar" en el 3.
  const barLabel = c.step === 3 ? 'Confirmar' : 'Continuar';
  const barDisabled = c.step === 1 ? !c.step1Done : c.step === 3 ? !c.canConfirm || c.isPending : false;
  const onBar = c.step === 1 ? c.continueStep1 : c.step === 2 ? c.continueStep2 : c.requestConfirm;

  return (
    <>
      <div className="pb-6 pt-8 md:pt-10">
        <h1 className="font-display text-[clamp(36px,4vw,52px)] leading-none text-text">Finaliza tu compra</h1>
        <p className="mt-2.5 font-body text-base text-text-soft">Son 3 pasos. Te toma un par de minutos.</p>
        <p className="mt-1 font-body text-[15px] text-text-muted">
          ¿Te ayudamos? Escríbenos al{' '}
          <a href={WA_URL} target="_blank" rel="noopener" className="font-semibold text-text underline underline-offset-4 hover:text-accent-hover">
            {WA_PHONE}
          </a>
        </p>
      </div>

      <div className="relative grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <CheckoutForm c={c} onLogin={c.openAuth} />
        <div className="min-w-0 rounded-md border border-border bg-surface p-5 md:p-6 lg:sticky lg:top-24">
          <CheckoutOrderSummary
            items={c.items}
            subtotal={c.subtotal}
            deliveryCost={c.deliveryCost}
            total={c.total}
            payphoneSurcharge={c.payphoneSurcharge}
            couponCode={c.couponCode}
            couponDiscount={c.couponDiscount}
            couponFreeShipping={c.couponFreeShipping}
            couponApplied={c.couponApplied}
            couponLoading={c.couponLoading}
            couponMessage={c.couponMessage}
            onCouponCodeChange={c.setCouponCode}
            onApplyCoupon={c.handleApplyCoupon}
            onRemoveCoupon={c.handleRemoveCoupon}
            shippingReady={c.step1Done}
            termsAccepted={c.termsAccepted}
            onTermsChange={c.setTermsAccepted}
            canConfirm={c.canConfirm}
            onConfirm={c.requestConfirm}
            isPending={c.isPending}
            missingText={c.missingText}
          />
        </div>

        {/* Registro/inicio de sesión sin salir del checkout (compra guest) */}
        <AuthModalIsland open={c.authOpen} onClose={c.closeAuth} />

        {c.bajoConfirmOpen && (
          <BajoPedidoConfirmModal
            isPending={c.isPending}
            items={c.backorderItems}
            onConfirm={c.confirmBajoPedido}
            onCancel={c.cancelBajoPedido}
          />
        )}
      </div>

      {/* Móvil: barra fija con el total y el avance (sin barra de navegación ni sello) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 hidden items-center justify-between gap-4 border-t border-border bg-bg px-4 pt-3 shadow-[0_-10px_30px_-18px_rgba(27,25,25,0.35)] max-[820px]:flex"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="min-w-0">
          <p className="font-body text-[12.5px] text-text-muted">Total a pagar</p>
          <p key={c.total} className="ck-total font-display text-[24px] leading-none tabular-nums text-text">
            {formatCurrency(c.total)}
          </p>
        </div>
        <button
          type="button"
          onClick={onBar}
          disabled={barDisabled}
          className="h-[54px] min-w-[150px] rounded-sm bg-text px-7 font-body text-[15px] font-semibold text-bg transition-[background-color,transform] duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted"
        >
          {barLabel}
        </button>
      </div>
      <div className="h-20 max-[820px]:block min-[821px]:hidden" aria-hidden="true" />
    </>
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
