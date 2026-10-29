import { useRef, useState } from 'react';
import { BANK_LOGO_SRC, PAYMENT_LOGOS } from '@/app/components/paymentLogos';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { PaymentMethod } from '../types';
import { optionClass, radioDotClass } from '../classes';

interface PaymentSectionProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  total: number;
  receiptFile: File | null;
  onReceiptChange: (file: File | null) => void;
}

type BankRow = [string, string, boolean?];

const BANKS: { id: string; name: string; logo: string; logoCls: string; rows: BankRow[] }[] = [
  {
    id: 'pichincha',
    name: 'Banco Pichincha',
    logo: BANK_LOGO_SRC.pichincha,
    logoCls: 'h-4 md:h-5',
    rows: [
      ['Tipo de cuenta', 'Cuenta de Ahorros'],
      ['Número de cuenta', '2213099079', true],
      ['Titular', 'Jean Philippe Wong'],
      ['Cédula', '0951454917', true],
      ['Correo', 'nondecants@gmail.com'],
    ],
  },
  {
    id: 'produbanco',
    name: 'Produbanco',
    logo: BANK_LOGO_SRC.produbanco,
    logoCls: 'h-5 md:h-6',
    rows: [
      ['Tipo de cuenta', 'Cuenta de Ahorros'],
      ['Número de cuenta', '20009323889', true],
      ['Titular', 'Wong Diaz Jean Philippe'],
      ['RUC / Identificación', '0951454917', true],
      ['Correo', 'nondecants@gmail.com'],
      ['Celular', '0992305463', true],
    ],
  },
  {
    id: 'guayaquil',
    name: 'Banco Guayaquil',
    logo: BANK_LOGO_SRC.guayaquil,
    logoCls: 'h-5 md:h-6',
    rows: [
      ['Tipo de cuenta', 'Cuenta de Ahorros'],
      ['Número de cuenta', '0060453629', true],
      ['CI', '0951454917', true],
      ['Correo', 'nondecants@gmail.com'],
      ['Celular', '0992305463', true],
    ],
  },
];

const CARD_LOGOS = PAYMENT_LOGOS.filter((l) => ['Payphone', 'Visa', 'Mastercard', 'Diners Club', 'Discover'].includes(l.alt));
const BANK_LOGOS = PAYMENT_LOGOS.filter((l) => ['Banco Pichincha', 'Banco Guayaquil', 'Produbanco'].includes(l.alt));

function LogoRow({ logos }: { logos: typeof PAYMENT_LOGOS }) {
  return (
    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2" aria-hidden="true">
      {logos.map((l) => (
        <img key={l.alt} src={l.src} alt="" loading="lazy" className={`${l.cls} w-auto object-contain`} />
      ))}
    </span>
  );
}

/** Paso 3 — ¿Cómo quieres pagar? */
export default function PaymentSection({ selected, onSelect, total, receiptFile, onReceiptChange }: PaymentSectionProps) {
  const [openBank, setOpenBank] = useState<string | null>('pichincha');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setFile = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    onReceiptChange(file);
  };

  return (
    <div className="flex flex-col gap-4" role="radiogroup" aria-label="Forma de pago">
      {/* Transferencia o depósito */}
      <div>
        <button
          type="button"
          role="radio"
          aria-checked={selected === 'TRANSFERENCIA'}
          onClick={() => onSelect('TRANSFERENCIA')}
          className={optionClass(selected === 'TRANSFERENCIA')}
        >
          <span className={radioDotClass(selected === 'TRANSFERENCIA')}>
            {selected === 'TRANSFERENCIA' && <span className="h-3 w-3 rounded-full bg-text" />}
          </span>
          <span className="min-w-0">
            <span className="block font-body text-[17px] font-bold leading-tight text-text">Transferencia o depósito</span>
            <span className="mt-1 block font-body text-[14.5px] text-text-muted">Sin recargo · subes tu comprobante</span>
            <LogoRow logos={BANK_LOGOS} />
          </span>
        </button>

        {selected === 'TRANSFERENCIA' && (
          <div className="ck-step-in mt-3 flex flex-col gap-4 rounded-md border border-border p-4">
            <p className="font-body text-base text-text-soft">
              <b>1.</b> Transfiere <span className="font-bold tabular-nums text-text">{formatCurrency(total)}</span> a cualquiera de estas cuentas:
            </p>

            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {BANKS.map((bank) => {
                const isOpen = openBank === bank.id;
                return (
                  <div key={bank.id}>
                    <button
                      type="button"
                      onClick={() => setOpenBank(isOpen ? null : bank.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-bg-alt"
                    >
                      <span className="flex items-center gap-3">
                        <img src={bank.logo} alt="" className={`${bank.logoCls} w-auto object-contain`} />
                        <span className="font-body text-base font-semibold text-text">{bank.name}</span>
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="divide-y divide-border border-t border-border bg-bg-alt">
                        {bank.rows.map(([label, value, mono]) => (
                          <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                            <span className="font-body text-[15px] text-text-muted">{label}</span>
                            <span className={`text-right font-body text-[15px] font-semibold text-text ${mono ? 'tabular-nums' : ''}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <p className="mb-2 font-body text-base font-bold text-text">
                <span className="mr-1">2.</span>Sube la foto o captura de tu comprobante
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {receiptFile ? (
                <div className="flex items-center gap-3">
                  {preview && <img src={preview} alt="Comprobante" className="h-24 w-auto rounded-md border border-border object-cover" />}
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate font-body text-sm text-text-muted">{receiptFile.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                      className="text-left font-body text-sm font-semibold text-text underline underline-offset-2 transition-colors hover:text-accent-hover"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed border-text-muted/50 bg-surface p-6 transition-colors hover:border-text"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-text-muted" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="font-body text-[16px] font-bold text-text">Toca aquí para subir tu comprobante</span>
                  <span className="font-body text-sm text-text-muted">JPG, PNG o PDF</span>
                </button>
              )}
            </div>

            <p className="rounded-md bg-gold-light px-4 py-3 font-body text-[15px] text-text-soft">
              Tu pedido se crea al confirmar. Verificaremos el pago y te avisaremos.
            </p>
          </div>
        )}
      </div>

      {/* Tarjeta */}
      <button
        type="button"
        role="radio"
        aria-checked={selected === 'PAYPHONE'}
        onClick={() => onSelect('PAYPHONE')}
        className={optionClass(selected === 'PAYPHONE')}
      >
        <span className={radioDotClass(selected === 'PAYPHONE')}>
          {selected === 'PAYPHONE' && <span className="h-3 w-3 rounded-full bg-text" />}
        </span>
        <span className="min-w-0">
          <span className="block font-body text-[17px] font-bold leading-tight text-text">Tarjeta de crédito o débito</span>
          <span className="mt-1 block font-body text-[14.5px] text-text-muted">Recargo del 6% por procesamiento (Payphone)</span>
          <LogoRow logos={CARD_LOGOS} />
        </span>
      </button>
    </div>
  );
}
