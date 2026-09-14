import { formatCurrency } from '@/app/helpers/formatCurrency';

interface FreeShippingBarProps {
  subtotal: number;
  threshold: number;
  unlocked: boolean;
}

/**
 * Barra del carrito: “te faltan X para envío gratis”.
 * El ancho anima con CSS (no JS) para que el progreso se sienta al agregar.
 */
export default function FreeShippingBar({
  subtotal,
  threshold,
  unlocked,
}: FreeShippingBarProps) {
  if (!(threshold > 0)) return null;

  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div className="mb-5">
      <p className="font-body text-[12px] leading-relaxed text-text">
        {unlocked ? (
          <span className="text-success">Envío gratis en este pedido</span>
        ) : (
          <>
            Te faltan{' '}
            <span className="text-text">{formatCurrency(remaining)}</span> para envío
            gratis
          </>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden bg-border" aria-hidden="true">
        <div
          className="h-full origin-left bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
