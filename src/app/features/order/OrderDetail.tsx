import AppProviders from '@/app/providers/AppProviders';
import { useOrderDetailHook } from './hooks/useOrderDetailHook';
import OrderConfirmation from './components/OrderConfirmation';

interface OrderDetailProps {
  orderId: string;
}

function OrderDetailContent({ orderId }: OrderDetailProps) {
  const { order, isLoading, isError } = useOrderDetailHook(orderId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
        {[60, 100, 80, 40].map((w, i) => (
          <div key={i} className="h-4 bg-[--color-surface] animate-pulse" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-[--color-text-muted]">No se encontró la orden.</p>
        <a href="/" className="mt-4 inline-block text-[--color-accent] text-sm hover:underline">
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <OrderConfirmation order={order} />
    </div>
  );
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  return (
    <AppProviders>
      <OrderDetailContent orderId={orderId} />
    </AppProviders>
  );
}
