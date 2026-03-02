import { formatCurrency } from '@/app/helpers/formatCurrency';

interface PayphoneSurchargeNoticeProps {
  surcharge: number;
}

export default function PayphoneSurchargeNotice({ surcharge }: PayphoneSurchargeNoticeProps) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border border-[--color-accent] bg-[--color-surface]"
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      <svg
        className="text-[--color-accent] shrink-0 mt-0.5"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <p className="text-sm font-medium text-[--color-accent]">
          Recargo del 6% por pago con tarjeta
        </p>
        <p className="text-xs text-[--color-text-muted] mt-0.5">
          Payphone aplica un recargo de{' '}
          <strong className="text-[--color-text]">{formatCurrency(surcharge)}</strong>{' '}
          sobre el total (subtotal + envío).
        </p>
      </div>
    </div>
  );
}
