import { formatCurrency } from '@/app/helpers/formatCurrency';
import OrderStatusBadge from './OrderStatusBadge';
import OrderTracking from './OrderTracking';
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
  RETIRO:                  'Retiro en tienda (Daule)',
  SERVIENTREGA_GYE:        'Servientrega GYE/Sam/Durán',
  SERVIENTREGA_NACIONAL:   'Servientrega Nacional',
};

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[--color-success]/20 border border-[--color-success]/40 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[--color-success]">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="font-heading text-3xl text-[--color-text] uppercase tracking-wider">
          ¡Orden confirmada!
        </h1>
        <p className="text-[--color-text-muted] text-sm mt-2">
          Pedido <span className="text-[--color-accent] font-medium">#{order.id.slice(-8).toUpperCase()}</span>
        </p>
        <div className="mt-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div className="bg-[--color-surface] border border-[--color-border] p-5" style={{ borderRadius: 'var(--radius-md)' }}>
        <h2 className="font-heading text-sm uppercase tracking-wider text-[--color-text-muted] mb-4">
          Productos
        </h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[--color-text-muted]">
                {item.name} · {item.ml}ml × {item.quantity}
              </span>
              <span className="text-[--color-text]">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[--color-border] mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[--color-text-muted]">Subtotal</span>
            <span className="text-[--color-text]">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[--color-text-muted]">Envío</span>
            <span className="text-[--color-text]">{order.deliveryCost === 0 ? 'GRATIS' : formatCurrency(order.deliveryCost)}</span>
          </div>
          {order.payphoneSurcharge > 0 && (
            <div className="flex justify-between">
              <span className="text-[--color-text-muted]">Recargo Payphone (6%)</span>
              <span className="text-[--color-accent]">+{formatCurrency(order.payphoneSurcharge)}</span>
            </div>
          )}
          <div className="flex justify-between font-heading text-base pt-2 border-t border-[--color-border]">
            <span className="text-[--color-text]">Total</span>
            <span className="text-[--color-accent]">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Info de envío */}
      <div className="bg-[--color-surface] border border-[--color-border] p-5 space-y-3" style={{ borderRadius: 'var(--radius-md)' }}>
        <h2 className="font-heading text-sm uppercase tracking-wider text-[--color-text-muted]">
          Información de entrega
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[--color-text-muted] text-xs mb-0.5">Cliente</p>
            <p className="text-[--color-text]">{order.customerName}</p>
          </div>
          <div>
            <p className="text-[--color-text-muted] text-xs mb-0.5">Email</p>
            <p className="text-[--color-text]">{order.customerEmail}</p>
          </div>
          <div>
            <p className="text-[--color-text-muted] text-xs mb-0.5">Ciudad</p>
            <p className="text-[--color-text]">{order.city}</p>
          </div>
          <div>
            <p className="text-[--color-text-muted] text-xs mb-0.5">Método de entrega</p>
            <p className="text-[--color-text]">{DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}</p>
          </div>
          <div>
            <p className="text-[--color-text-muted] text-xs mb-0.5">Método de pago</p>
            <p className="text-[--color-text]">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Tracking */}
      <OrderTracking trackingCode={order.trackingCode} />

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/catalogo"
          className="px-8 py-3 border border-[--color-border-accent] text-[--color-accent] font-heading text-sm uppercase tracking-wider text-center hover:bg-[--color-surface] transition-colors"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          Seguir comprando
        </a>
      </div>
    </div>
  );
}
