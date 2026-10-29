import CheckoutStepCard from './CheckoutStepCard';
import AddressSection from './AddressSection';
import DeliverySection, { PICKUP_PLACES } from './DeliverySection';
import PaymentSection from './PaymentSection';
import type { useCheckoutHook } from '../hooks/useCheckoutHook';

type CheckoutState = ReturnType<typeof useCheckoutHook>;

interface CheckoutFormProps {
  c: CheckoutState;
  onLogin: () => void;
}

/** Los 3 pasos del checkout como acordeón numerado (sin stepper). */
export default function CheckoutForm({ c, onLogin }: CheckoutFormProps) {
  const { step, setStep } = c;

  const step1Summary = c.isPickup
    ? (c.deliveryMethod && PICKUP_PLACES[c.deliveryMethod]?.name) || 'Retiro en Guayaquil'
    : c.customer.city
      ? `Servientrega a ${c.customer.city}`
      : '';
  const step2Summary = [`${c.customer.name} ${c.customer.lastName}`.trim(), c.customer.phone].filter(Boolean).join(' · ');

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <CheckoutStepCard
        n={1}
        title="¿Cómo quieres recibir tu pedido?"
        open={step === 1}
        done={c.step1Done && step > 1}
        summary={step1Summary}
        onEdit={() => setStep(1)}
      >
        <DeliverySection
          options={c.deliveryOptions}
          selected={c.deliveryMethod}
          onSelect={c.setDeliveryMethod}
          mode={c.deliveryMode}
          onModeChange={c.setDeliveryMode}
          city={c.customer.city}
          onCityChange={c.setCity}
          shippingCost={c.deliveryCost}
          canContinue={c.step1Done}
          onContinue={c.continueStep1}
        />
      </CheckoutStepCard>

      <CheckoutStepCard
        n={2}
        title="Tus datos"
        open={step === 2}
        done={c.step2Done && step > 2}
        summary={step2Summary}
        onEdit={c.step1Done ? () => setStep(2) : undefined}
      >
        <AddressSection
          customer={c.customer}
          onChange={c.handleCustomerChange}
          isPickup={c.isPickup}
          errors={c.contactErrors}
          showErrors={c.showErrors}
          shakeTick={c.shakeTick}
          isAuthenticated={c.isAuthenticated}
          onLogin={onLogin}
          savedAddresses={c.savedAddresses}
          selectedAddressId={c.selectedAddressId}
          onSelectAddress={c.handleSelectAddress}
          onContinue={c.continueStep2}
        />
      </CheckoutStepCard>

      <CheckoutStepCard n={3} title="¿Cómo quieres pagar?" open={step === 3} done={false}>
        <PaymentSection
          selected={c.paymentMethod}
          onSelect={c.setPaymentMethod}
          total={c.total}
          receiptFile={c.receiptFile}
          onReceiptChange={c.setReceiptFile}
        />
      </CheckoutStepCard>
    </div>
  );
}
