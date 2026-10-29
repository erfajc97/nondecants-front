import { useMemo } from 'react';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useLandingSectionsActiveQuery } from '@/app/tanstack-queries/landingSectionsQuery';
import type { Product } from '@/app/types/global.types';
import { useCartPageHook } from '../hooks/useCartPageHook';
import CartSuggestion from './CartSuggestion';
import CartDrawerLine from './CartDrawerLine';
import FreeShippingBar from './FreeShippingBar';

interface CartDrawerContentProps {
  onClose: () => void;
  onCheckout: () => void;
}

/**
 * Cuerpo del carrito lateral. Se monta recién la primera vez que se abre el
 * drawer (así no dispara las queries de ajustes en cada página).
 */
export default function CartDrawerContent({ onClose, onCheckout }: CartDrawerContentProps) {
  const cart = useCartPageHook();
  const { data: cartSections = [] } = useLandingSectionsActiveQuery('cart');
  const { data: homeSections = [] } = useLandingSectionsActiveQuery('home');
  // Sin sección "carrito" en el admin se promocionan las destacadas del home.
  const hasCartProducts = cartSections.some((s) => (s.products ?? []).length > 0);
  const sections = hasCartProducts ? cartSections : homeSections;

  const sectionTitle = sections[0]?.title || 'Completa tu pedido';

  const suggestions = useMemo(() => {
    const inCart = new Set(cart.items.map((i) => String(i.productId)));
    const seen = new Set<string>();
    const out: Product[] = [];
    for (const s of [...sections].sort((a, b) => a.order - b.order)) {
      for (const p of s.products ?? []) {
        if (seen.has(p.id) || inCart.has(String(p.id))) continue;
        seen.add(p.id);
        out.push(p);
      }
    }
    return out.slice(0, 4);
  }, [sections, cart.items]);

  const btnMain =
    'flex h-[52px] w-full items-center justify-center gap-2.5 rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft';

  const Suggestions = ({ title, max }: { title: string; max: number }) =>
    suggestions.length === 0 ? null : (
      <div className="py-4">
        <h3 className="mb-2.5 font-body text-[13px] font-semibold text-text-muted">{title}</h3>
        <div className="grid gap-2">
          {suggestions.slice(0, max).map((p) => (
            <CartSuggestion key={p.id} product={p} onNavigate={onClose} />
          ))}
        </div>
      </div>
    );

  /* Esqueleto mientras se hidrata el carrito desde localStorage */
  if (!cart.hasHydrated) {
    return (
      <div className="flex-1 animate-pulse space-y-4 px-5 py-4" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="grid grid-cols-[72px_1fr] gap-3.5">
            <div className="h-[72px] w-[72px] bg-bg-alt" />
            <div className="space-y-2"><div className="h-4 w-3/4 bg-bg-alt" /><div className="h-3 w-1/2 bg-bg-alt" /></div>
          </div>
        ))}
      </div>
    );
  }

  /* Carrito vacío */
  if (cart.itemCount === 0) {
    return (
      <div className="flex-1 overflow-auto overscroll-contain px-5 py-10 text-center">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-text-muted" aria-hidden="true">
          <path d="M5 8h14l-1 12H6L5 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        <p className="mt-4 font-display text-[28px] leading-tight text-text">Tu carrito está vacío</p>
        <p className="mt-2 font-body text-[15px] text-text-muted">Empieza con un 3 ml de los más pedidos.</p>
        <a
          href="/catalogo/perfumes"
          onClick={onClose}
          className="mt-5 inline-flex h-11 items-center rounded-full border border-text px-6 font-body text-sm font-semibold text-text transition-colors hover:bg-text hover:text-bg"
        >
          Ver perfumes
        </a>
        <div className="mt-6 text-left">
          <Suggestions title="Lo más pedido" max={4} />
        </div>
      </div>
    );
  }

  const hasBajo = cart.bajo.length > 0;
  const rows = [
    ...cart.immediate.map((r) => ({ r, g: 'immediate' as const })),
    ...cart.bajo.map((r) => ({ r, g: 'bajo' as const })),
  ];

  return (
    <>
      <div className="flex-1 overflow-auto overscroll-contain px-5">
        {rows.map(({ r, g }, i) => (
          <CartDrawerLine
            key={`${g}-${r.item.variantId}`}
            row={r}
            group={g}
            index={i}
            onSetTotal={cart.updateQty}
            onRemove={cart.removeItem}
          />
        ))}
        {hasBajo && (
          <p className="mt-4 rounded-md bg-gold-light px-4 py-3 font-body text-[13.5px] text-text-soft">
            Los productos por encargo los importamos especialmente para ti y llegan en 13 a 17 días.
          </p>
        )}
        <Suggestions title={sectionTitle} max={3} />
      </div>

      <div className="grid gap-2.5 border-t border-border px-5 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-4">
        <FreeShippingBar
          subtotal={cart.afterDiscount}
          threshold={cart.freeShippingThreshold}
          unlocked={cart.qualifiesFreeShipping}
        />
        {cart.couponDiscount > 0 && (
          <div className="flex justify-between font-body text-[15px] text-text-soft">
            <span>Cupón</span>
            <span className="tabular-nums text-success">-{formatCurrency(cart.couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between font-body text-lg font-bold text-text">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(cart.subtotal)}</span>
        </div>
        <p className="text-center font-body text-[12.5px] text-text-muted">
          El envío y el cupón se calculan en el siguiente paso.
        </p>
        <button onClick={onCheckout} className={btnMain}>
          Ir a pagar <span aria-hidden="true">→</span>
        </button>
        <button
          onClick={onClose}
          className="justify-self-center font-body text-[13.5px] font-semibold text-text-muted underline underline-offset-4 transition-colors hover:text-text"
        >
          Seguir comprando
        </button>
        <a href="/carrito" className="justify-self-center font-body text-[12.5px] text-text-muted underline underline-offset-4 hover:text-text">
          Ver carrito completo
        </a>
      </div>
    </>
  );
}
