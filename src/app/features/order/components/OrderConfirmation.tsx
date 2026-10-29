import { formatCurrency } from '@/app/helpers/formatCurrency';
import OrderStatusBadge from './OrderStatusBadge';
import OrderTracking from './OrderTracking';
import GoogleReviewOptIn from './GoogleReviewOptIn';
import type { Order } from '@/app/types/global.types';

interface OrderConfirmationProps {
  order: Order;
}

const PAYMENT_LABELS: Record<string, string> = {
  PAYPHONE:       'Payphone (tarjeta)',
  TRANSFERENCIA:  'Transferencia bancaria',
  EFECTIVO:       'Efectivo',
};

const DELIVERY_LABELS: Record<string, string> = {
  RETIRO:                  'Retiro en tienda',
  SERVIENTREGA_GYE:        'Servientrega GYE/Sam/Durán',
  SERVIENTREGA_NACIONAL:   'Servientrega Nacional',
};

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <GoogleReviewOptIn
        orderId={order.id}
        email={order.customerEmail}
        deliveryMethod={order.deliveryMethod}
      />

      {/* Cabecera */}
      <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface px-6 py-9 text-center md:py-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-bg">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display text-[clamp(34px,4vw,48px)] leading-none text-text">¡Orden confirmada!</h1>
        <p className="font-body text-[17px] text-text-soft">
          Pedido <span className="font-bold text-text">#{order.id.slice(-8).toUpperCase()}</span>
        </p>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Productos */}
      <div className="rounded-md border border-border bg-surface p-5 md:p-6">
        <h2 className="mb-4 border-b border-border pb-4 font-body! text-xl font-bold text-text">Productos</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4 font-body text-[15px]">
              <span className="text-text-soft">
                {item.name} · {item.ml}ml × {item.quantity}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-text">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2.5 border-t border-border pt-4 font-body text-[15px]">
          <div className="flex justify-between">
            <span className="text-text-soft">Subtotal</span>
            <span className="tabular-nums text-text">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-soft">Envío</span>
            <span className="tabular-nums text-text">{order.deliveryCost === 0 ? 'Gratis' : formatCurrency(order.deliveryCost)}</span>
          </div>
          {order.payphoneSurcharge > 0 && (
            <div className="flex justify-between">
              <span className="text-text-muted">Recargo Payphone (6%)</span>
              <span className="tabular-nums text-text-muted">+{formatCurrency(order.payphoneSurcharge)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
            <span className="text-text">Total</span>
            <span className="tabular-nums text-text">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Entrega */}
      <div className="rounded-md border border-border bg-surface p-5 md:p-6">
        <h2 className="mb-4 border-b border-border pb-4 font-body! text-xl font-bold text-text">Información de entrega</h2>
        <dl className="grid grid-cols-1 gap-4 font-body text-[15px] sm:grid-cols-2">
          {[
            ['Cliente', order.customerName],
            ['Email', order.customerEmail],
            ['Ciudad', order.city],
            ['Método de entrega', DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod],
            ['Método de pago', PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="mb-0.5 text-sm text-text-muted">{label}</dt>
              <dd className="font-semibold text-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tracking */}
      <OrderTracking trackingCode={order.trackingCode} />

      {/* Acciones */}
      <div className="flex justify-center pt-2">
        <a
          href="/catalogo"
          className="inline-flex h-[52px] w-full items-center justify-center rounded-sm border-[1.5px] border-text px-7 font-body text-[14.5px] font-semibold text-text transition-colors hover:bg-bg-alt sm:w-auto"
        >
          Seguir comprando
        </a>
      </div>
    </div>
  );
}
