import AppProviders from '@/app/providers/AppProviders';
import { useCheckoutHook } from './hooks/useCheckoutHook';
import CustomerForm from './components/CustomerForm';
import DeliveryMethodSelector from './components/DeliveryMethodSelector';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import OrderSummary from './components/OrderSummary';

function CheckoutContent() {
  const {
    customer,
    deliveryMethod,
    paymentMethod,
    deliveryOptions,
    deliveryLoading,
    subtotal,
    deliveryCost,
    payphoneSurcharge,
    isPayphone,
    total,
    items,
    isPending,
    handleCustomerChange,
    setDeliveryMethod,
    setPaymentMethod,
    handleSubmit,
  } = useCheckoutHook();

  // Redirige si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-[--color-text-muted] mb-4">Tu carrito está vacío.</p>
        <a href="/catalogo" className="text-[--color-accent] text-sm hover:underline">
          Ir al catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading text-3xl text-[--color-text] uppercase tracking-wider mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-10">
          <CustomerForm data={customer} onChange={handleCustomerChange} />

          <DeliveryMethodSelector
            options={deliveryOptions}
            selected={deliveryMethod}
            isLoading={deliveryLoading}
            city={customer.city}
            onChange={setDeliveryMethod}
          />

          <PaymentMethodSelector
            selected={paymentMethod}
            onChange={setPaymentMethod}
          />
        </div>

        {/* Resumen */}
        <div>
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryCost={deliveryCost}
            payphoneSurcharge={payphoneSurcharge}
            isPayphone={isPayphone}
            total={total}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <AppProviders>
      <CheckoutContent />
    </AppProviders>
  );
}
