import { useCartHook } from '../hooks/useCartHook';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { useCartStore } from '@/app/store/cart/cartStore';

export default function CartDrawer() {
  const { items, total, isDrawerOpen, setDrawerOpen, removeItem, updateQty } = useCartHook();
  const itemCount = useCartStore((s) => s.itemCount());

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[--color-bg] border-l border-[--color-border] flex flex-col shadow-2xl"
        role="dialog"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border]">
          <h2 className="font-heading text-lg uppercase tracking-wider text-[--color-text]">
            Carrito
          </h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-[--color-text-muted] hover:text-[--color-text] transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-[--color-text-muted]">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p className="text-[--color-text-muted] text-sm">Tu carrito está vacío.</p>
              <a
                href="/catalogo"
                onClick={() => setDrawerOpen(false)}
                className="text-[--color-accent] text-sm hover:underline"
              >
                Explorar catálogo
              </a>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  onRemove={removeItem}
                  onQtyChange={updateQty}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="px-5 pb-6 pt-2">
            <CartSummary
              total={total}
              itemCount={itemCount}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        )}
      </div>
    </>
  );
}
