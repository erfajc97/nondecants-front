import { formatCurrency } from '@/app/helpers/formatCurrency';

interface CartSummaryProps {
  total: number;
  itemCount: number;
  onClose: () => void;
}

export default function CartSummary({ total, itemCount, onClose }: CartSummaryProps) {
  return (
    <div className="border-t border-[--color-border] pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[--color-text-muted]">
          Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
        </span>
        <span className="font-heading text-lg text-[--color-accent]">{formatCurrency(total)}</span>
      </div>
      <p className="text-xs text-[--color-text-muted]">
        Envío y recargo Payphone se calculan en el checkout.
      </p>
      <a
        href="/checkout"
        onClick={onClose}
        className="block w-full text-center py-3.5 bg-[--color-accent] text-[--color-bg] font-heading uppercase tracking-widest text-sm hover:bg-[--color-accent-hover] transition-colors"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        Ir al checkout
      </a>
    </div>
  );
}
