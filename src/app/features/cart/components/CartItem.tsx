import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { CartItem as CartItemType } from '@/app/store/cart/cartStore';

interface CartItemProps {
  item: CartItemType;
  onRemove: (variantId: string) => void;
  onQtyChange: (variantId: string, qty: number) => void;
}

export default function CartItem({ item, onRemove, onQtyChange }: CartItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-[--color-border] last:border-0">
      {/* Image */}
      <div className="w-16 h-20 shrink-0 bg-[--color-surface-raised] overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[--color-text-muted]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[--color-text-muted] uppercase tracking-wider truncate">{item.brand}</p>
        <p className="text-sm text-[--color-text] font-medium leading-snug line-clamp-2">{item.name}</p>
        <p className="text-xs text-[--color-text-muted] mt-0.5">{item.ml}ml</p>

        <div className="flex items-center justify-between mt-2">
          {/* Qty */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => onQtyChange(item.variantId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center border border-r-0 border-[--color-border] text-[--color-text-muted] hover:text-[--color-text] text-xs"
              style={{ borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
            >−</button>
            <span className="w-8 h-7 flex items-center justify-center border-y border-[--color-border] text-xs text-[--color-text]">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.variantId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center border border-l-0 border-[--color-border] text-[--color-text-muted] hover:text-[--color-text] text-xs"
              style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
            >+</button>
          </div>

          <p className="text-sm font-heading text-[--color-accent]">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.variantId)}
        className="p-1 text-[--color-text-muted] hover:text-[--color-error] transition-colors self-start"
        aria-label="Eliminar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
