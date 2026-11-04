import { BANK_LOGO_SRC } from '@/app/components/paymentLogos';

/**
 * Cuenta bancaria para transferencias. El ajuste `bank_accounts` guarda un JSON
 * array con estos campos; `documentLabel`, `email` y `phone` son opcionales.
 */
export interface BankAccount {
  bank: string;
  accountType: string;
  accountNumber: string;
  holder?: string;
  document: string;
  /** Etiqueta del documento (defecto "Cédula"). */
  documentLabel?: string;
  email?: string;
  phone?: string;
}

/** Cuentas actuales (lo que había en código); respaldo si el ajuste no existe. */
export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: 'Banco Pichincha',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '2213099079',
    holder: 'Jean Philippe Wong',
    document: '0951454917',
    email: 'nondecants@gmail.com',
  },
  {
    bank: 'Produbanco',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '20009323889',
    holder: 'Wong Diaz Jean Philippe',
    document: '0951454917',
    documentLabel: 'RUC / Identificación',
    email: 'nondecants@gmail.com',
    phone: '0992305463',
  },
  {
    bank: 'Banco Guayaquil',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '0060453629',
    document: '0951454917',
    documentLabel: 'CI',
    email: 'nondecants@gmail.com',
    phone: '0992305463',
  },
];

const LOGOS: { match: string; src: string; cls: string }[] = [
  { match: 'pichincha', src: BANK_LOGO_SRC.pichincha, cls: 'h-4 md:h-5' },
  { match: 'produbanco', src: BANK_LOGO_SRC.produbanco, cls: 'h-5 md:h-6' },
  { match: 'guayaquil', src: BANK_LOGO_SRC.guayaquil, cls: 'h-5 md:h-6' },
];

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Logo por nombre de banco normalizado; sin coincidencia, solo texto. */
export function bankLogo(bank: string): { src: string; cls: string } | null {
  const n = normalize(bank);
  return LOGOS.find((l) => n.includes(l.match)) ?? null;
}

export type BankRow = [label: string, value: string, mono?: boolean];

/** Filas visibles de una cuenta, en el orden de siempre. */
export function bankRows(a: BankAccount): BankRow[] {
  const rows: BankRow[] = [
    ['Tipo de cuenta', a.accountType],
    ['Número de cuenta', a.accountNumber, true],
  ];
  if (a.holder) rows.push(['Titular', a.holder]);
  rows.push([a.documentLabel || 'Cédula', a.document, true]);
  if (a.email) rows.push(['Correo', a.email]);
  if (a.phone) rows.push(['Celular', a.phone, true]);
  return rows.filter((r) => r[1]);
}
