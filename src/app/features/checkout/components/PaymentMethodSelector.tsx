import type { PaymentMethod } from '../types';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value:       'PAYPHONE',
    label:       'Payphone',
    description: 'Pago con tarjeta de crédito/débito. Recargo del 6%.',
  },
  {
    value:       'TRANSFERENCIA',
    label:       'Transferencia bancaria',
    description: 'Te enviamos los datos por WhatsApp/email.',
  },
  {
    value:       'EFECTIVO',
    label:       'Efectivo',
    description: 'Solo para retiro en tienda (Daule).',
  },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-base uppercase tracking-wider text-[--color-text]">
        Método de pago
      </h2>
      <div className="space-y-2">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full flex items-start gap-3 px-4 py-3.5 border text-sm text-left transition-colors ${
              selected === opt.value
                ? 'border-[--color-accent] bg-[--color-surface]'
                : 'border-[--color-border] hover:border-[--color-accent]'
            }`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <span
              className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${
                selected === opt.value
                  ? 'border-[--color-accent] bg-[--color-accent]'
                  : 'border-[--color-border]'
              }`}
            />
            <div>
              <p className="font-medium text-[--color-text]">{opt.label}</p>
              <p className="text-xs text-[--color-text-muted] mt-0.5">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
