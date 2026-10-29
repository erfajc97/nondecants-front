import { useCartPageHook, type CartRow } from '../hooks/useCartPageHook';
import CartLine from './CartLine';
import CartPageSummary from './CartPageSummary';
import CartRecommendations from './CartRecommendations';

function GroupHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="mb-1 flex items-end justify-between gap-3 border-b border-border pb-3">
      <h2 className="font-display text-[26px] leading-none text-text">{title}</h2>
      <span className="font-body text-[13px] text-text-muted">{meta}</span>
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
      <section className="mx-auto max-w-[1480px] animate-pulse px-4 py-8 md:px-[clamp(16px,3.4vw,52px)] md:py-16" aria-hidden="true">
        <div className="mb-7 md:mb-16">
          <div className="h-3 w-24 rounded-sm bg-bg-alt" />
          <div className="mt-4 h-12 w-64 rounded-sm bg-bg-alt md:h-16 md:w-80" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-sm bg-bg-alt" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-6">
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
      <section className="mx-auto flex min-h-[50vh] max-w-[1480px] flex-col items-center justify-center gap-4 px-4 py-12 text-center md:px-[clamp(16px,3.4vw,52px)] md:py-16">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted">
          <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        <h1 className="font-display text-4xl text-text">Tu carrito está vacío</h1>
        <p className="max-w-sm font-body text-base text-text-muted">
          Explora el catálogo y descubre fragancias en stock o bajo pedido.
        </p>
        <a
          href="/catalogo/perfumes"
          className="mt-2 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft"
        >
          Ver perfumes
          <span aria-hidden="true">→</span>
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
    <section className="mx-auto max-w-[1480px] px-4 py-6 md:px-[clamp(16px,3.4vw,52px)] md:py-10">
      {/* ── Encabezado ── */}
      <header className="mb-6 md:mb-8">
        <h1 className="font-display text-[clamp(36px,4vw,52px)] leading-none text-text">
          Tu carrito <span className="text-text-muted">({itemCount})</span>
        </h1>
        <p className="mt-2 max-w-xl font-body text-base text-text-muted">
          {mixed ? (
            <>Tu carrito combina referencias <span className="font-semibold text-text">en stock</span> y referencias <span className="font-semibold text-warning">bajo pedido</span>.</>
          ) : bajo.length > 0 ? (
            <>Todas tus referencias son <span className="font-semibold text-warning">bajo pedido</span>.</>
          ) : (
            <>Todas tus referencias están <span className="font-semibold text-text">en stock</span>, listas para envío.</>
          )}
        </p>
      </header>

      {/* ── Cuerpo: items (izq) + resumen (der) ── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Items agrupados */}
        <div className="min-w-0 rounded-md border border-border bg-surface px-4 py-5 md:px-6 md:py-6">
          {immediate.length > 0 && (
            <div className={bajo.length > 0 ? 'mb-8' : ''}>
              <GroupHeader title="Envío inmediato" meta="Servientrega · 24–72 h" />
              <div>{immediate.map((r) => renderRow(r, 'immediate'))}</div>
            </div>
          )}

          {bajo.length > 0 && (
            <div>
              <GroupHeader title="Bajo pedido" meta="Plazo 13–17 días" />
              <div>{bajo.map((r) => renderRow(r, 'bajo'))}</div>
              <p className="mt-5 rounded-md bg-gold-light px-4 py-3 font-body text-[15px] text-text-soft">
                Este perfume lo traemos exclusivamente para ti. Verificado por NonDecants antes de enviártelo.
              </p>
            </div>
          )}
        </div>

        {/* Resumen sticky */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
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
