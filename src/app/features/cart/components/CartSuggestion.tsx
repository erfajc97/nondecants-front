import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useProductCardHook } from '@/app/features/product/hooks/useProductCardHook';
import type { Product } from '@/app/types/global.types';

/**
 * Producto sugerido dentro del carrito lateral (publicidad de las secciones
 * "carrito" del admin). Se agrega con un toque: usa el formato más chico
 * disponible, igual que el "+" de las cards, y la miniatura vuela al carrito.
 */
export default function CartSuggestion({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  const c = useProductCardHook(product);
  const price = c.finalPrice;
  const canAdd = c.canPurchase && price > 0;

  return (
    <div className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[3px] border border-border p-2 font-body text-[12.5px] leading-[1.3] transition-colors hover:border-text">
      <a href={c.productUrl} onClick={onNavigate} className="contents">
        {c.displayImage ? <img src={c.displayImage} alt="" className="h-[46px] w-[46px] object-contain" /> : <span />}
        <span className="min-w-0">
          <b className="line-clamp-2 block font-semibold text-text">{product.name}</b>
          <span className="text-text-muted">
            {c.selected && !c.selected.isFullBottle ? `${c.selected.ml} ml · ` : 'Desde '}
            {formatCurrency(price)}
          </span>
        </span>
      </a>
      {canAdd && (
        <button
          type="button"
          onClick={c.handleQuickAdd}
          aria-label={`Agregar ${product.name} al carrito`}
          className="grid h-9 w-9 place-items-center rounded-full bg-text text-lg leading-none text-bg transition-colors hover:bg-text-soft"
        >
          +
        </button>
      )}
    </div>
  );
}
