import { useCartPageHook, type CartRow } from '../hooks/useCartPageHook';
import CartLine from './CartLine';
import CartPageSummary from './CartPageSummary';
import CartRecommendations from './CartRecommendations';

function GroupHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="mb-1 flex items-end justify-between border-b border-border pb-4">
      <h2 className="font-display text-2xl font-light text-text">{title}</h2>
      <span className="font-body text-[10px] uppercase tracking-[0.16em] text-text-muted">{meta}</span>
    </div>
  );
}

export default function CartPage() {
  const {
    immediate,
    bajo,
    immediateSubtotal,
    bajoSubtotal,
    shipping,
    total,
    itemCount,
    removeItem,
    updateQty,
    hasHydrated,
    deliveryOffset,
    cutoffHour,
    freeShippingThreshold,
    qualifiesFreeShipping,
    couponDiscount,
    afterDiscount,
  } = useCartPageHook();

  // Esqueleto mientras se hidrata el carrito desde localStorage: evita el
  // parpadeo SSR/hidratación y el salto de layout al aparecer los items.
  if (!hasHydrated) {
    return (
      <section className="mx-auto max-w-[1600px] animate-pulse px-6 py-8 md:px-12 md:py-20" aria-hidden="true">
        <div className="mb-7 md:mb-16">
          <div className="h-3 w-24 rounded-sm bg-bg-alt" />
          <div className="mt-4 h-12 w-64 rounded-sm bg-bg-alt md:h-16 md:w-80" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-sm bg-bg-alt" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-16 xl:gap-24">
          <div>
            <div className="mb-4 h-6 w-48 rounded-sm bg-bg-alt" />
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-5 border-b border-border py-6">
                <div className="h-28 w-24 shrink-0 bg-bg-alt" />
                <div className="flex-1">
                  <div className="h-4 w-3/5 rounded-sm bg-bg-alt" />
                  <div className="mt-2 h-3 w-2/5 rounded-sm bg-bg-alt" />
                </div>
                <div className="h-8 w-24 rounded-sm bg-bg-alt" />
              </div>
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="h-72 w-full bg-bg-alt" />
          </div>
        </div>
      </section>
    );
  }

  // ── Carrito vacío ──
  if (itemCount === 0) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-[1600px] flex-col items-center justify-center gap-5 px-6 py-12 text-center md:py-16">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-text-muted">
          <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        <h1 className="font-display text-4xl font-light text-text">Tu carrito está vacío</h1>
        <p className="max-w-sm font-body text-sm text-text-soft">
          Explora el catálogo y descubre fragancias en stock o bajo pedido.
        </p>
        <a
          href="/catalogo/perfumes"
          className="mt-2 inline-flex items-center gap-2 bg-text px-8 py-4 font-body text-xs font-medium uppercase tracking-[0.2em] text-bg transition-colors hover:bg-accent"
        >
          Explorar catálogo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12h14M14 6l6 6-6 6" /></svg>
        </a>

        <div className="w-full text-left">
          <CartRecommendations />
        </div>
      </section>
    );
  }

  const mixed = immediate.length > 0 && bajo.length > 0;

  const renderRow = (row: CartRow, group: 'immediate' | 'bajo') => (
    <CartLine
      key={`${group}-${row.item.variantId}`}
      row={row}
      group={group}
      deliveryOffset={deliveryOffset}
      cutoffHour={cutoffHour}
      onSetTotal={updateQty}
      onRemove={removeItem}
    />
  );

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-6 md:px-12 md:py-12">
      {/* ── Encabezado ── */}
      <header className="mb-6 md:mb-10">
        <span className="eyebrow">— Tu selección</span>
        <h1 className="mt-3 font-display text-5xl font-light leading-none tracking-[-0.025em] text-text md:text-7xl">
          Carrito <span className="italic text-text-soft">({itemCount})</span>
        </h1>
        <p className="mt-4 max-w-xl font-body text-sm text-text-soft">
          {mixed ? (
            <>Tu carrito combina referencias <span className="text-text">en stock</span> y referencias <span className="italic">bajo pedido</span>.</>
          ) : bajo.length > 0 ? (
            <>Todas tus referencias son <span className="italic">bajo pedido</span>.</>
          ) : (
            <>Todas tus referencias están <span className="text-text">en stock</span>, listas para envío.</>
          )}
        </p>
      </header>

      {/* ── Cuerpo: items (izq) + resumen (der) ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-16 xl:gap-24">
        {/* Items agrupados */}
        <div>
          {immediate.length > 0 && (
            <div className="mb-8 md:mb-14">
              <GroupHeader title="Envío inmediato" meta="Servientrega · 24–72 h" />
              <div>{immediate.map((r) => renderRow(r, 'immediate'))}</div>
            </div>
          )}

          {bajo.length > 0 && (
            <div>
              <GroupHeader title="Bajo pedido" meta="Plazo 13–17 días" />
              <div>{bajo.map((r) => renderRow(r, 'bajo'))}</div>
              <p className="mt-6 border-l-2 border-accent bg-bg-alt px-4 py-3 font-display text-sm italic text-text-soft">
                Este perfume lo traemos exclusivamente para ti. Verificado por NonDecants antes de enviártelo.
              </p>
            </div>
          )}
        </div>

        {/* Resumen sticky */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CartPageSummary
            immediateSubtotal={immediateSubtotal}
            bajoSubtotal={bajoSubtotal}
            shipping={shipping}
            total={total}
            immediateCount={immediate.length}
            bajoCount={bajo.length}
            afterDiscount={afterDiscount}
            couponDiscount={couponDiscount}
            freeShippingThreshold={freeShippingThreshold}
            qualifiesFreeShipping={qualifiesFreeShipping}
          />
        </aside>
      </div>

      {/* Publicidad de productos — se administra desde el admin */}
      <CartRecommendations />
    </section>
  );
}
