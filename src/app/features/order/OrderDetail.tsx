import AppProviders from '@/app/providers/AppProviders';
import { useOrderDetailHook } from './hooks/useOrderDetailHook';
import OrderConfirmation from './components/OrderConfirmation';
import Loader from '@/app/components/Loader';

interface OrderDetailProps {
  orderId: string;
}

function OrderDetailContent({ orderId }: OrderDetailProps) {
  const { order, isLoading, isError } = useOrderDetailHook(orderId);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16 md:py-32">
        <Loader size={45} color="var(--color-accent)" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center md:py-20">
        <p className="font-body text-base text-text-muted">No se encontró la orden.</p>
        <a href="/" className="mt-4 inline-block font-body text-[15px] font-semibold text-text underline underline-offset-4 hover:text-accent-hover">
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl bg-bg-alt px-4 py-10 sm:px-6 md:py-14">
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
