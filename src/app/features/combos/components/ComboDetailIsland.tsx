import { useEffect, useMemo, useState } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { flyToCart } from '@/app/helpers/flyToCart';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { BACKORDER_LABEL, DEFAULT_DISPATCH_CUTOFF_HOUR } from '@/app/helpers/deliveryWindow';
import { useActiveCombosQuery } from '@/app/tanstack-queries/combosQuery';
import { useDeliveryOffsetQuery, useDispatchCutoffQuery } from '@/app/tanstack-queries/settingsQuery';
import { useCartStore } from '@/app/store/cart/cartStore';
import PaymentMethodIcons from '@/app/components/PaymentMethodIcons';
import { DispatchCountdown, TrustRow } from '@/app/features/product/components/ProductPurchaseOptions';
import type { Combo } from '@/app/types/global.types';
import {
  buildComboCartItem,
  comboProductImage,
  comboProductNotes,
  comboSizes,
  sizeFromQuery,
} from '../comboPricing';
import ComboCard from './ComboCard';
import '@/app/features/product/product-detail.css';

interface ComboDetailIslandProps {
  combo: Combo;
}

const BTN =
  'pdp-btn relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[3px] font-body font-semibold tracking-[0.01em] transition-[background-color,color,transform] duration-200 active:scale-[0.97]';

function ComboDetailContent({ combo }: ComboDetailIslandProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { data: allCombos = [] } = useActiveCombosQuery();
  const others = allCombos.filter((c) => String(c.id) !== String(combo.id) && !c.parentComboId).slice(0, 4);
  const { data: deliveryOffset = 0 } = useDeliveryOffsetQuery();
  const { data: cutoffHour = DEFAULT_DISPATCH_CUTOFF_HOUR } = useDispatchCutoffQuery();

  const sizes = useMemo(() => comboSizes(combo), [combo]);
  const [ml, setMl] = useState<number>(sizes[0].ml);
  const size = sizes.find((s) => s.ml === ml) ?? sizes[0];
  const hasPicker = size.ml > 0;

  // ?size=5 (desde la tarjeta): se aplica tras montar para no romper la hidratación.
  useEffect(() => {
    const q = sizeFromQuery(sizes);
    if (q) setMl(q);
  }, [sizes]);

  const products = size.products;
  const image = size.combo.imageUrl || combo.imageUrl;
  const story = (combo.description ?? '').trim();
  const shortStory = story.split(/(?<=[.!?])\s/)[0] ?? '';

  const handleAddToCart = (e: { currentTarget: Element }) => {
    const item = buildComboCartItem(combo, size);
    addItem(item);
    sonnerResponse(`${combo.name} agregado al carrito.`, 'success');
    // El carrito lateral se abre solo; el cliente sigue en el combo.
    flyToCart(e.currentTarget, item.image);
  };

  const handleWhatsapp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://nondecants.com/combo/${combo.id}`;
    const msg = `Hola, estoy interesado/a en el combo "${combo.name}"${hasPicker ? ` (decants de ${size.ml} ml)` : ''}: ${url}`;
    window.open(`https://wa.me/593992305463?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const waIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.996 2C6.474 2 2 6.474 2 11.996C2 13.921 2.548 15.717 3.511 17.25L2.146 22.18L7.204 20.852C8.683 21.688 10.297 22.158 11.996 22.158C17.518 22.158 22 17.684 22 12.162C22 6.64 17.518 2.166 11.996 2.166V2ZM17.152 16.315C16.94 16.91 16.1 17.433 15.441 17.545C14.945 17.625 14.284 17.682 11.838 16.669C8.91 15.452 7.027 12.441 6.884 12.253C6.741 12.064 5.72 10.71 5.72 9.31C5.72 7.91 6.442 7.238 6.741 6.93C6.983 6.681 7.404 6.551 7.82 6.551C7.962 6.551 8.089 6.558 8.199 6.564C8.484 6.577 8.627 6.602 8.814 7.051C9.05 7.618 9.623 9.022 9.693 9.172C9.764 9.322 9.851 9.531 9.742 9.742C9.643 9.941 9.551 10.035 9.408 10.203C9.266 10.372 9.13 10.493 8.979 10.672C8.847 10.832 8.694 10.992 8.865 11.282C9.036 11.571 9.625 12.532 10.489 13.303C11.603 14.298 12.51 14.611 12.83 14.743C13.151 14.875 13.34 14.856 13.568 14.613C13.797 14.368 14.441 13.621 14.713 13.313C14.985 13.003 15.241 13.041 15.526 13.144C15.811 13.248 17.324 13.996 17.625 14.145C17.925 14.295 18.125 14.369 18.196 14.494C18.267 14.618 18.267 15.308 17.965 15.939L17.152 16.315Z" />
    </svg>
  );

  const trust = [
    { t: '100%', l: 'Original y sellado', icon: 'sealCheck' as const },
    { t: String(size.decants), l: size.decants === 1 ? 'decant en una caja' : 'decants en una caja', icon: 'gift' as const },
    { t: '3 · 5 · 10', l: 'ml decantados aquí', icon: 'dropHalf' as const },
  ];

  const scrollToProduct = (id: string | number) => {
    document.getElementById(`combo-p-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-[clamp(24px,4.5vw,72px)]">
        {/* Foto + una miniatura por perfume (5 por fila) que baja a su tarjeta */}
        <div className="min-w-0 md:sticky md:top-24">
          <div className="relative aspect-square overflow-hidden rounded-md bg-bg-alt">
            {image ? (
              <img src={image} alt={combo.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" />
                </svg>
              </div>
            )}
            {size.hasBajoPedido && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-warning shadow-[0_0_0_1px_var(--color-border)]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Bajo pedido
              </span>
            )}
          </div>
          {products.length > 0 && (
            <ul className="mt-2.5 grid grid-cols-5 gap-2" aria-label="Perfumes del combo">
              {products.map((cp) => {
                const img = comboProductImage(cp);
                return (
                  <li key={cp.id}>
                    <button
                      type="button"
                      onClick={() => scrollToProduct(cp.id)}
                      title={cp.product?.name}
                      aria-label={`Ver ${cp.product?.name ?? 'perfume'}`}
                      className="block aspect-square w-full overflow-hidden rounded-sm border border-border bg-white transition-[border-color,transform] duration-200 hover:border-text active:scale-[0.97]"
                    >
                      {img ? <img src={img} alt="" loading="lazy" className="h-full w-full object-contain p-1.5" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Info + compra */}
        <div className="grid min-w-0 gap-4 text-text">
          <span className="font-body text-[13px] font-semibold text-text">
            Combo · {products.length} {products.length === 1 ? 'fragancia' : 'fragancias'}
          </span>
          <h1 className="-mt-2 font-display text-[clamp(38px,4vw,56px)] font-normal leading-none tracking-[-0.02em] text-text">
            {combo.name}
          </h1>
          {shortStory && <p className="font-body text-base leading-normal text-text-soft">{shortStory}</p>}

          {/* Una nota de color por perfume */}
          {products.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {products.map((cp) => {
                const note = comboProductNotes(cp, 1)[0];
                return (
                  <li
                    key={cp.id}
                    className="inline-flex items-center gap-2 rounded-full bg-bg-alt py-[5px] pl-2 pr-3 font-body text-[12.5px] text-text-soft"
                  >
                    <i
                      aria-hidden="true"
                      className="block h-3.5 w-3.5 rounded-full bg-border"
                      style={note?.color ? { background: note.color } : undefined}
                    />
                    <span className="font-semibold text-text">{cp.product?.name ?? 'Producto'}</span>
                    {note && <span className="text-text-muted">· {note.name}</span>}
                  </li>
                );
              })}
            </ul>
          )}

          {/* 1. Tamaño de cada decant */}
          {hasPicker && (
            <div>
              <div className="mb-2 font-body text-sm font-semibold">1. Elige el tamaño de cada decant</div>
              <div
                role="group"
                aria-label="Tamaño de cada decant"
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${Math.min(sizes.length, 5)}, minmax(0, 1fr))` }}
              >
                {sizes.map((s) => {
                  const active = s.ml === size.ml;
                  return (
                    <button
                      key={s.ml}
                      type="button"
                      onClick={() => setMl(s.ml)}
                      aria-pressed={active}
                      style={{ ['--lv' as string]: Math.min(1, s.ml / 10) }}
                      className={`size-tile flex h-[54px] flex-col items-center justify-center rounded-[3px] border font-body leading-[1.15] transition-[border-color,background-color] duration-200 active:scale-[0.97] ${
                        active
                          ? 'border-text bg-text text-white'
                          : 'border-border text-text hover:border-text-muted/50'
                      }`}
                    >
                      <b className="text-[15px] font-bold">{s.ml} ml</b>
                      <small className={`text-[13px] ${active ? 'text-accent' : 'text-text-muted'}`}>
                        {s.totalMl} ml en total
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Precio, por separado y ahorro */}
          <div>
            {hasPicker && (
              <p className="mb-2 font-body text-[13.5px] text-text-muted">
                {size.decants} decants de {size.ml} ml
                {size.savings > 0 && (
                  <>
                    {' · '}por separado costarían <s>{formatCurrency(size.before)}</s>
                  </>
                )}
              </p>
            )}
            <div className="font-body text-[32px] font-bold leading-none tabular-nums">
              <span key={size.ml} className="pdp-tick">
                {formatCurrency(size.price)}
              </span>
            </div>
            {size.savings > 0 && (
              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 font-body text-[13.5px] text-text-muted">
                <span className="rounded-full bg-gold-light px-2 py-0.5 text-xs font-semibold text-accent-hover">
                  Ahorras {formatCurrency(size.savings)} ({size.pct}%)
                </span>
              </p>
            )}
          </div>

          {/* Despacho */}
          {!size.inStock ? (
            <div className="border-y border-border py-3.5 font-body text-[15px]">
              <b className="font-semibold text-warning">Sin stock por ahora</b>
            </div>
          ) : size.hasBajoPedido ? (
            <div className="border-y border-border py-3.5 font-body text-[15px]">
              <b className="font-semibold text-warning">Bajo pedido</b>
              <br />
              <span className="text-text-soft">Llega en {BACKORDER_LABEL}</span>
            </div>
          ) : (
            <DispatchCountdown cutoffHour={cutoffHour} offsetDays={deliveryOffset} stockLeft={null} />
          )}

          {/* CTAs */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={size.inStock ? handleAddToCart : undefined}
              disabled={!size.inStock}
              className={`${BTN} h-[56px] bg-text px-6 text-[14.5px] text-white hover:bg-[#34312f] disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {size.inStock ? `Agregar combo · ${formatCurrency(size.price)}` : 'Combo agotado'}
            </button>
            <button
              type="button"
              onClick={handleWhatsapp}
              className={`${BTN} h-[56px] bg-white px-3 text-[14.5px] text-[#1c8f4a] shadow-[inset_0_0_0_1.5px_#1c8f4a] hover:bg-[#1c8f4a] hover:text-white`}
            >
              {waIcon}
              Pedir por WhatsApp
            </button>
          </div>

          {/* Confianza: igual que la ficha de producto */}
          <TrustRow items={trust} />

          <div className="border-t border-border pt-3.5">
            <span className="font-body text-sm font-semibold text-text">Pago</span>
            <PaymentMethodIcons className="mt-2.5" />
          </div>
        </div>
      </div>

      {/* Qué trae tu combo */}
      {products.length > 0 && (
        <section className="mt-14 border-t border-border pt-10 md:mt-20 md:pt-14">
          <span className="eyebrow">Qué trae tu combo</span>
          <h2 className="mt-2 font-display text-[28px] leading-[1.05] tracking-[-0.02em] text-text md:text-4xl">
            {products.length} {products.length === 1 ? 'fragancia' : 'fragancias'}, una historia.
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((cp) => {
              const img = comboProductImage(cp);
              const notes = comboProductNotes(cp, 3);
              const brand = (cp.product as { marca?: { name?: string } } | undefined)?.marca?.name;
              const solo = size.ml > 0 ? sizeSolo(cp, size.ml) : Number(cp.productVariation?.price ?? cp.product?.price ?? 0);
              return (
                <article
                  key={cp.id}
                  id={`combo-p-${cp.id}`}
                  className="pdp-anchor flex flex-col overflow-hidden rounded-sm border border-border bg-surface"
                >
                  <a href={cp.product?.id != null ? `/producto/${cp.product.id}` : undefined} className="relative block aspect-[4/3] bg-bg-alt">
                    {img ? <img src={img} alt={cp.product?.name ?? ''} loading="lazy" className="h-full w-full object-contain p-4" /> : null}
                    {size.ml > 0 && (
                      <span className="absolute bottom-2.5 left-2.5 rounded-full bg-text px-2.5 py-1 font-body text-xs font-bold tabular-nums text-bg">
                        {size.ml} ml
                      </span>
                    )}
                  </a>
                  <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                    {brand && <span className="font-body text-[12.5px] text-text-muted">{brand}</span>}
                    <h3 className="font-display text-[22px] font-normal leading-tight text-text">
                      {cp.product?.name ?? 'Producto'}
                    </h3>
                    {cp.product?.description && (
                      <p className="font-body text-[13.5px] leading-snug text-accent-hover">{cp.product.description}</p>
                    )}
                    {notes.length > 0 && (
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {notes.map((n) => (
                          <li
                            key={n.name}
                            className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-bg-alt py-0 pl-2.5 pr-3 font-body text-[12.5px] text-text-soft"
                            style={n.color ? { background: `color-mix(in srgb, ${n.color} 13%, transparent)` } : undefined}
                          >
                            <i aria-hidden="true" className="block h-2 w-2 rounded-full" style={{ background: n.color }} />
                            {n.name}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-2.5 font-body text-sm tabular-nums text-text-soft">
                      Solo: <b className="font-semibold text-text">{formatCurrency(solo)}</b>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {size.before > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border font-body">
              <div className="bg-surface p-3.5 md:p-4">
                <span className="block text-[12.5px] text-text-muted">Por separado</span>
                <s className="text-lg tabular-nums text-text-muted">{formatCurrency(size.before)}</s>
              </div>
              <div className="bg-surface p-3.5 md:p-4">
                <span className="block text-[12.5px] text-text-muted">En combo</span>
                <b className="text-lg tabular-nums text-text">{formatCurrency(size.price)}</b>
              </div>
              <div className="bg-gold-light p-3.5 md:p-4">
                <span className="block text-[12.5px] text-text-muted">Te ahorras</span>
                <b className="text-lg tabular-nums text-success">{formatCurrency(size.savings)}</b>
              </div>
            </div>
          )}
        </section>
      )}

      {/* La historia */}
      {story && (
        <section className="mt-14 border-t border-border pt-10 md:mt-20 md:pt-14">
          <span className="eyebrow">La historia</span>
          <h2 className="mt-2 font-display text-[28px] leading-[1.05] tracking-[-0.02em] text-text md:text-4xl">
            {combo.name}
          </h2>
          <p className="mt-5 max-w-[64ch] whitespace-pre-line font-body text-base leading-[1.7] text-text-soft">{story}</p>
        </section>
      )}

      {/* Otros combos */}
      {others.length > 0 && (
        <section className="mt-14 border-t border-border pt-10 md:mt-20 md:pt-14">
          <span className="eyebrow">Combos</span>
          <h2 className="mt-2 font-display text-[28px] leading-[1.05] tracking-[-0.02em] text-text md:text-4xl">
            Otros combos de la casa
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-[18px]">
            {others.map((c) => (
              <ComboCard key={c.id} combo={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Precio del decant de `ml` de un perfume del combo (sin descuento de combo). */
function sizeSolo(cp: Combo['comboProducts'][number], ml: number): number {
  const own = cp.productVariation as unknown as { price?: number | string; mlSize?: number; ml?: number; isFullBottle?: boolean } | undefined;
  if (own && Number(own.mlSize ?? own.ml) === ml && !own.isFullBottle) return Number(own.price ?? 0);
  const p = cp.product as unknown as { variants?: any[]; variations?: any[]; price?: number };
  const list = p?.variants ?? p?.variations ?? [];
  const found = list.find((v) => !v.isFullBottle && Number(v.mlSize ?? v.ml) === ml);
  return Number(found?.price ?? own?.price ?? p?.price ?? 0);
}

export default function ComboDetailIsland({ combo }: ComboDetailIslandProps) {
  return (
    <AppProviders>
      <ComboDetailContent combo={combo} />
    </AppProviders>
  );
}
