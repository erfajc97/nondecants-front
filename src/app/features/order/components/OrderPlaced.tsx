import NodSeal from '@/app/components/UI/NodSeal';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import '@/app/features/checkout/checkout.css';

interface OrderPlacedProps {
  orderNumber?: string;
  email?: string;
  total?: number;
  /** Pago por transferencia: el comprobante queda en revisión. */
  transfer?: boolean;
  /** Pedido simulado del ambiente de demostración. */
  demo?: boolean;
}

const SPARKS = [
  { dx: -92, dy: -64 },
  { dx: 88, dy: -70 },
  { dx: -108, dy: 8 },
  { dx: 104, dy: 14 },
  { dx: -64, dy: 78 },
  { dx: 70, dy: 82 },
  { dx: 0, dy: -96 },
  { dx: -30, dy: 96 },
];

/**
 * Pedido recibido (prototipo): el sello cae como un timbre con chispas, y debajo
 * "¡Pedido recibido!" con el aviso de la confirmación por WhatsApp.
 */
export default function OrderPlaced({ orderNumber, email, total, transfer, demo }: OrderPlacedProps) {
  return (
    <div className="mx-auto my-8 grid max-w-[640px] justify-items-center gap-4 rounded-md border border-border bg-surface px-6 py-10 text-center md:px-14 md:py-14">
      <div className="relative mb-2 grid h-[140px] w-[140px] place-items-center">
        {SPARKS.map((s, i) => (
          <i
            key={i}
            className="ck-spark"
            aria-hidden="true"
            style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px`, animationDelay: `${0.95 + i * 0.03}s` }}
          />
        ))}
        <div className="ck-stamp">
          <NodSeal size={118} />
        </div>
      </div>

      <h1 className="font-display text-[clamp(34px,4.4vw,52px)] leading-none text-text">¡Pedido recibido!</h1>

      {orderNumber && (
        <p className="font-body text-[17px] text-text-soft">
          Pedido <span className="font-bold text-text">#{orderNumber}</span>
          {total ? (
            <>
              {' · '}
              <span className="font-bold tabular-nums text-text">{formatCurrency(total)}</span>
            </>
          ) : null}
        </p>
      )}

      <p className="max-w-[46ch] font-body text-[16px] leading-relaxed text-text-soft">
        Te enviaremos la confirmación por <b className="text-text">WhatsApp</b>
        {email ? (
          <>
            {' '}y a <b className="[overflow-wrap:anywhere] text-text">{email}</b>
          </>
        ) : null}
        .{' '}
        {transfer
          ? 'Revisaremos tu comprobante y te avisaremos apenas confirmemos el pago.'
          : 'Ya estamos preparando tu pedido.'}
      </p>

      {demo && (
        <p className="max-w-[46ch] rounded-md bg-gold-light px-4 py-3 font-body text-[14px] text-text-soft">
          Ambiente de demostración: este pedido es una simulación, no se guardó ni se cobró nada.
        </p>
      )}

      <div className="mt-3 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <a
          href="/catalogo/perfumes"
          className="inline-flex h-[52px] flex-1 items-center justify-center rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97]"
        >
          Seguir comprando
        </a>
        <a
          href="/cuenta"
          className="inline-flex h-[52px] flex-1 items-center justify-center rounded-sm border-[1.5px] border-text px-7 font-body text-[14.5px] font-semibold text-text transition-[background-color,transform] duration-200 hover:bg-bg-alt active:scale-[0.97]"
        >
          Ver mis pedidos
        </a>
      </div>
    </div>
  );
}
