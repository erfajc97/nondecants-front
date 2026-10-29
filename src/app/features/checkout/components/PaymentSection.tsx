import type { PaymentMethod } from '../types';
import { optionClass, radioDotClass } from '../classes';


interface PaymentSectionProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

/* Solo el nombre del método: los logos de las tarjetas ya se muestran en el
   resumen del pedido y acá competían con el texto. */
const METHODS: { key: PaymentMethod; label: string; hint: string; icon?: React.ReactNode }[] = [
  {
    key: 'PAYPHONE',
    label: 'Tarjeta débito o crédito',
    hint: 'Recargo de 6% por procesamiento (Payphone)',
  },
  {
    key: 'TRANSFERENCIA',
    label: 'Transferencia bancaria / Depósito',
    hint: 'Sin recargo · subes tu comprobante',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

export default function PaymentSection({ selected, onSelect }: PaymentSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="mb-1 font-body! text-xl font-bold text-text">Método de pago</h2>
      {selected === 'PAYPHONE' && (
        <p className="rounded-md bg-gold-light px-4 py-3 font-body text-[15px] text-text-soft">
          Se aplica un recargo del 6% por procesamiento con tarjeta.
        </p>
      )}
      {selected === 'TRANSFERENCIA' && (
        <p className="rounded-md bg-bg-alt px-4 py-3 font-body text-[15px] text-text-soft">
          Después de confirmar, podrás subir tu comprobante de transferencia.
        </p>
      )}
      {METHODS.map((m) => (
        <label
          key={m.key}
          onClick={() => onSelect(m.key)}
          className={`cursor-pointer items-center ${optionClass(selected === m.key)}`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`${radioDotClass(selected === m.key)} mt-0`}>
              {selected === m.key && <div className="h-3 w-3 rounded-full bg-text" />}
            </div>
            {m.icon}
            <span className="flex flex-col">
              <span className="font-body text-[17px] font-semibold text-text">{m.label}</span>
              <span className="font-body text-[13.5px] text-text-muted">{m.hint}</span>
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
