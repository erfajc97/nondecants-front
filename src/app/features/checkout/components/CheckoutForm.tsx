import Loader from '@/app/components/Loader';
import CheckoutStepTabs from './CheckoutStepTabs';
import ContactSection from './ContactSection';
import AddressSection from './AddressSection';
import DeliverySection, { type DeliveryMode } from './DeliverySection';
import PaymentSection from './PaymentSection';
import TransferBankInfoStep from './TransferBankInfoStep';
import TermsAcceptance from './TermsAcceptance';
import { validateContact } from '../validators';
import { BTN_PRIMARY } from '../classes';
import type { CustomerFormData, DeliveryMethod, PaymentMethod, DeliveryOption } from '../types';
import type { Address } from '@/app/features/profile/types';

interface CheckoutFormProps {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  customer: CustomerFormData;
  deliveryMethod: DeliveryMethod | null;
  paymentMethod: PaymentMethod | null;
  deliveryOptions: DeliveryOption[];
  deliveryLoading: boolean;
  isPending: boolean;
  total: number;
  handleCustomerChange: (field: keyof CustomerFormData, value: string) => void;
  setDeliveryMethod: (val: DeliveryMethod) => void;
  setPaymentMethod: (val: PaymentMethod) => void;
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
  handleNextStep: () => void;
  handleSubmit: () => void;
  handleTransferSubmit: (receiptFile: File) => void;
  deliveryMode: DeliveryMode;
  setDeliveryMode: (mode: DeliveryMode) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  /** Direcciones guardadas del usuario (REQ-062); vacío si es guest. */
  savedAddresses: Address[];
  selectedAddressId: string | null;
  handleSelectAddress: (id: string | null) => void;
}

export default function CheckoutForm({
  step,
  setStep,
  customer,
  deliveryMethod,
  paymentMethod,
  deliveryOptions,
  deliveryLoading,
  isPending,
  total,
  handleCustomerChange,
  setDeliveryMethod,
  setPaymentMethod,
  termsAccepted,
  setTermsAccepted,
  handleNextStep,
  handleSubmit,
  handleTransferSubmit,
  deliveryMode,
  setDeliveryMode,
  isAuthenticated,
  onLogin,
  savedAddresses,
  selectedAddressId,
  handleSelectAddress,
}: CheckoutFormProps) {

  // El paso 1 solo avanza con los datos completos y un método de entrega
  // elegido: hasta entonces el botón queda deshabilitado.
  // El modo manda sobre los campos: al marcar "retiro" la dirección sobra
  // aunque todavía no se haya elegido el punto concreto.
  const isPickup = deliveryMode === 'pickup';
  const contactError = validateContact(customer, { requiresAddress: !isPickup });
  const canContinue = contactError === null && deliveryMethod !== null;

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) handleNextStep();
    else if (step === 2) {
      if (paymentMethod === 'TRANSFERENCIA') {
        setStep(3);
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <form className="flex flex-col gap-7" onSubmit={onFormSubmit}>
      {step !== 3 && <CheckoutStepTabs step={step} setStep={setStep} />}

      {step === 1 && (
        <>
          <DeliverySection
            options={deliveryOptions}
            isLoading={deliveryLoading}
            selected={deliveryMethod}
            onSelect={setDeliveryMethod}
            mode={deliveryMode}
            onModeChange={setDeliveryMode}
          />
          <ContactSection
            customer={customer}
            onChange={handleCustomerChange}
            isAuthenticated={isAuthenticated}
            onLogin={onLogin}
          />
          <AddressSection
            customer={customer}
            onChange={handleCustomerChange}
            isPickup={isPickup}
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={handleSelectAddress}
          />
          <div className="mt-2">
            <button type="submit" disabled={!canContinue} className={BTN_PRIMARY}>
              Continuar
              <span aria-hidden="true">→</span>
            </button>
            {!canContinue && (
              <p className="mt-2.5 font-body text-sm text-text-muted">
                {contactError ?? 'Selecciona un método de entrega.'}
              </p>
            )}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <PaymentSection selected={paymentMethod} onSelect={setPaymentMethod} />
          <TermsAcceptance checked={termsAccepted} onChange={setTermsAccepted} />
          <button
            type="submit"
            disabled={isPending || !paymentMethod || !termsAccepted}
            className={`${BTN_PRIMARY} mt-2`}
          >
            {isPending ? (
              <Loader size={18} color="#fff" className="mx-auto" />
            ) : paymentMethod === 'TRANSFERENCIA' ? (
              'Ver datos bancarios'
            ) : (
              'Confirmar pedido'
            )}
          </button>
        </>
      )}

      {step === 3 && (
        <TransferBankInfoStep
          total={total}
          isPending={isPending}
          termsAccepted={termsAccepted}
          onTermsChange={setTermsAccepted}
          onConfirm={handleTransferSubmit}
          onBack={() => setStep(2)}
        />
      )}
    </form>
  );
}
