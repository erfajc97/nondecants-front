import { useRef, useState } from 'react';
import Loader from '@/app/components/Loader';
import { BANK_LOGO_SRC } from '@/app/components/paymentLogos';
import TermsAcceptance from './TermsAcceptance';
import { BTN_PRIMARY } from '../classes';

interface TransferBankInfoStepProps {
  total: number;
  isPending: boolean;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onConfirm: (receiptFile: File) => void;
  onBack: () => void;
}

type BankRow = [string, string, boolean?];

interface BankInfo {
  id: string;
  name: string;
  logo: React.ReactNode;
  rows: BankRow[];
}

const BANKS: BankInfo[] = [
  {
    id: 'pichincha',
    name: 'Banco Pichincha',
    logo: <img src={BANK_LOGO_SRC.pichincha} alt="Banco Pichincha" className="h-4 w-auto object-contain md:h-5" />,
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
    logo: <img src={BANK_LOGO_SRC.produbanco} alt="Produbanco" className="h-5 w-auto object-contain md:h-6" />,
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
    logo: <img src={BANK_LOGO_SRC.guayaquil} alt="Banco Guayaquil" className="h-5 w-auto object-contain md:h-6" />,
    rows: [
      ['Tipo de cuenta', 'Cuenta de Ahorros'],
      ['Número de cuenta', '0060453629', true],
      ['CI', '0951454917', true],
      ['Correo', 'nondecants@gmail.com'],
      ['Celular', '0992305463', true],
    ],
  },
];

export default function TransferBankInfoStep({ total, isPending, termsAccepted, onTermsChange, onConfirm, onBack }: TransferBankInfoStepProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [openBank, setOpenBank] = useState<string | null>('pichincha');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setReceiptFile(file);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-body! text-xl font-bold text-text">Datos para transferencia</h2>

      <p className="font-body text-base text-text-soft">
        <b>1.</b> Transfiere <span className="font-bold text-text">${total.toFixed(2)}</span> a cualquiera de estas cuentas:
      </p>

      {/* Selector de banco: cada uno despliega sus datos */}
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
                  {bank.logo}
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
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <div className="divide-y divide-border border-t border-border bg-bg-alt">
                  {bank.rows.map(([label, value, mono]) => (
                    <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                      <span className="font-body text-[15px] text-text-muted">{label}</span>
                      <span className={`text-right text-[15px] font-semibold text-text ${mono ? 'font-body tabular-nums' : 'font-body'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comprobante */}
      <div>
        <p className="mb-2 font-body text-[17px] font-bold text-text"><span className="mr-1">2.</span>Sube la foto o captura de tu comprobante *</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        {receiptPreview ? (
          <div className="flex items-center gap-3">
            <img src={receiptPreview} alt="Comprobante" className="h-24 w-auto rounded-md border border-border object-cover" />
            <div className="flex flex-col gap-1">
              <p className="font-body text-sm text-text-muted">{receiptFile?.name}</p>
              <button
                type="button"
                onClick={() => { handleFileChange(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="text-left font-body text-sm font-semibold text-text underline underline-offset-2 transition-colors hover:text-accent-hover"
              >
                Cambiar imagen
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed border-text-muted/50 bg-surface p-6 transition-colors hover:border-text"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-text-muted">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="font-body text-[17px] font-bold text-text">Subir comprobante</span>
            <span className="font-body text-sm text-text-muted">JPG, PNG o PDF</span>
          </button>
        )}
      </div>

      {/* Aviso */}
      <div className="rounded-md bg-gold-light px-4 py-3">
        <p className="font-body text-[15px] text-text-soft">
          Tu orden será creada una vez subas el comprobante. Verificaremos el pago y te notificaremos.
        </p>
      </div>

      <TermsAcceptance checked={termsAccepted} onChange={onTermsChange} />

      {/* Acciones */}
      <button
        type="button"
        onClick={() => receiptFile && termsAccepted && onConfirm(receiptFile)}
        disabled={!receiptFile || !termsAccepted || isPending}
        className={`${BTN_PRIMARY} mt-2`}
      >
        {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : 'Confirmar pedido'}
      </button>
      <button
        type="button"
        onClick={onBack}
        disabled={isPending}
        className="w-full py-2 font-body text-[15px] font-semibold text-text-muted underline underline-offset-4 transition-colors hover:text-text"
      >
        Volver
      </button>
    </div>
  );
}
