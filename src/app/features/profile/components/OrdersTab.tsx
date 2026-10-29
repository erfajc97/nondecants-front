import { useState, useEffect } from 'react';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import OrderReviewsPanel from '@/app/features/reviews/components/OrderReviewsPanel';

interface OrderItem {
  id: number;
  productId?: number;
  productName?: string;
  productImage?: string;
  mlSize?: number;
  isFullBottle?: boolean;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryMethod?: string;
  trackingCode?: string;
  shippingAddress?: string;
  shippingCity?: string;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  order_created: { label: 'Pendiente de pago', color: 'bg-amber-100 text-amber-700' },
  order_received: { label: 'Pagado', color: 'bg-blue-100 text-blue-700' },
  order_accepted: { label: 'Pagado', color: 'bg-blue-100 text-blue-700' },
  order_shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700' },
  order_delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  order_cancelled: { label: 'Cancelado', color: 'bg-error text-white' },
  order_delayed: { label: 'Retrasado', color: 'bg-amber-100 text-amber-700' },
  order_rejected: { label: 'Rechazado', color: 'bg-error text-white' },
}

const PAID_STATUSES = ['order_received', 'order_accepted', 'order_shipped', 'order_delivered'];

const isServientrega = (m?: string) => m === 'SERVIENTREGA_GYE' || m === 'SERVIENTREGA_NACIONAL';

interface HistoryEntry {
  id: number;
  toStatus: string;
  changedBy: string;
  note?: string;
  createdAt: string;
}

// Timeline step icons per status
const STEP_ICON: Record<string, string> = {
  order_created: '🛒',
  order_received: '✅',
  order_accepted: '📦',
  order_shipped: '🚚',
  order_delivered: '🎉',
  order_cancelled: '❌',
  order_delayed: '⏳',
  order_rejected: '🚫',
  nuevo: '🆕',
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    axiosInstance.get(API_ENDPOINTS.ORDERS)
      .then(({ data }) => {
        const list = data?.data ?? data;
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch history when order is selected
  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    axiosInstance.get(`${API_ENDPOINTS.ORDERS}/${selected.id}/history`)
      .then(({ data }) => setHistory(data?.data ?? data ?? []))
      .catch(() => setHistory([]));
  }, [selected?.id]);

  // Detail view
  if (selected) {
    const s = STATUS_MAP[selected.status] || { label: selected.status, color: 'bg-surface-raised text-text-muted' };
    return (
      <div className="space-y-5">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver a mis pedidos
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-normal text-text">{selected.orderNumber}</h2>
            <p className="mt-0.5 font-body text-xs text-text-muted">{new Date(selected.createdAt).toLocaleDateString('es-EC', { dateStyle: 'long' })}</p>
          </div>
          <span className={`px-3 py-1 font-body text-[13px] font-semibold ${s.color}`}>{s.label}</span>
        </div>

        {/* Items */}
        <div className="border border-border divide-y divide-border">
          {selected.items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center p-3">
              <div className="w-12 h-12 bg-surface-raised overflow-hidden shrink-0">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">Sin img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{item.productName || 'Producto'}</p>
                <p className="text-xs text-text-muted">{item.mlSize ? `${item.mlSize}ml ${item.isFullBottle ? 'Botella' : 'Decant'}` : ''} · {item.quantity}x</p>
              </div>
              <p className="text-sm font-bold text-text">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {PAID_STATUSES.includes(selected.status) && (
          <OrderReviewsPanel items={selected.items} />
        )}

        {/* Total */}
        <div className="flex justify-between items-center text-base font-bold text-text">
          <span>Total</span>
          <span>{formatCurrency(selected.total)}</span>
        </div>

        {/* Tracking for Servientrega */}
        {isServientrega(selected.deliveryMethod) && selected.trackingCode && (
          <div className="border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-bold text-blue-800 mb-1">Número de guía Servientrega</p>
            <p className="text-lg font-body font-bold tabular-nums text-blue-900 mb-2">{selected.trackingCode}</p>
            <p className="text-xs text-blue-700 mb-2">
              Haz clic para rastrear tu envío con tu número de guía:
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(
                  `https://www.servientrega.com.ec/Tracking/Index/?guia=${encodeURIComponent(selected.trackingCode!)}`,
                  '_blank',
                  'noopener,noreferrer',
                )
              }}
              className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 text-white text-xs font-bold px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Rastrear en Servientrega
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          </div>
        )}

        {isServientrega(selected.deliveryMethod) && !selected.trackingCode && (
          <div className="border border-border bg-surface-raised p-4">
            <p className="text-sm text-text-muted">Tu número de guía será asignado cuando despachemos tu pedido.</p>
          </div>
        )}

        {/* Delivery info */}
        {(selected.shippingAddress || selected.shippingCity) && (
          <div className="text-xs text-text-muted">
            <span className="font-semibold text-text-muted">Envío a:</span> {selected.shippingAddress}{selected.shippingCity ? `, ${selected.shippingCity}` : ''}
          </div>
        )}

        {/* Status Timeline */}
        {history.length > 0 && (
          <div className="border border-border bg-bg-alt p-6">
            <span className="eyebrow mb-5 block">Seguimiento de tu pedido</span>
            <div className="relative pl-8">
              <div className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded-full bg-linear-to-b from-accent via-border to-border-soft" />
              {history.map((entry, i) => {
                const label = STATUS_MAP[entry.toStatus]?.label ?? entry.toStatus;
                const icon = STEP_ICON[entry.toStatus] ?? '📋';
                const isLast = i === history.length - 1;
                const isFirst = i === 0;
                return (
                  <div key={entry.id} className={`relative pb-5 last:pb-0 ${isLast ? '' : ''}`}>
                    <div className={`absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isLast ? 'bg-accent shadow-md shadow-accent/30' : isFirst ? 'bg-surface-raised' : 'bg-surface-raised'
                    }`}>
                      <span className={isLast ? 'grayscale-0' : 'grayscale opacity-60'}>{icon}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isLast ? 'text-text' : 'text-text-muted'}`}>{label}</p>
                      {entry.note && <p className="text-xs text-text-muted mt-0.5">{entry.note}</p>}
                      <p className="text-sm text-text-muted">
                        {new Date(entry.createdAt).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-normal text-text">Mis pedidos</h2>
        <p className="mt-1 font-body text-sm text-text-soft">Revisa el estado de tus pedidos</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-text" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">No tienes pedidos aún.</p>
          <a href="/catalogo" className="text-accent text-sm font-medium hover:underline mt-2 inline-block">Explorar catálogo</a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const s = STATUS_MAP[order.status] || { label: order.status, color: 'bg-surface-raised text-text-muted' };
            const firstItem = order.items[0];
            const hasTracking = isServientrega(order.deliveryMethod) && order.trackingCode;
            const awaitingTracking = isServientrega(order.deliveryMethod) && !order.trackingCode;
            return (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="group flex w-full cursor-pointer items-center gap-4 border border-border p-4 text-left transition-colors hover:border-text"
              >
                <div className="w-14 h-14 bg-surface-raised overflow-hidden shrink-0">
                  {firstItem?.productImage ? (
                    <img src={firstItem.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-normal text-text">{order.orderNumber}</p>
                    <span className={`px-2 py-0.5 font-body text-[11px] font-semibold ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {order.items.length} producto{order.items.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                    {' · '}<span className="font-bold text-text">{formatCurrency(order.total)}</span>
                  </p>
                  {hasTracking && (
                    <p className="text-sm text-blue-600 font-semibold mt-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      Guía asignada — Ver detalle de envío
                    </p>
                  )}
                  {awaitingTracking && (
                    <p className="text-sm text-amber-600 mt-1">Guía pendiente de asignación</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors group-hover:border-accent">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-muted transition-colors group-hover:text-accent"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
