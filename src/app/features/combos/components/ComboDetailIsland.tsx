import { useState } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { flyToCart } from '@/app/helpers/flyToCart';
import { useActiveCombosQuery } from '@/app/tanstack-queries/combosQuery';
import ComboCard from './ComboCard';
import { useCartStore } from '@/app/store/cart/cartStore';
/* Medios de pago aceptados — mismo componente que la ficha de producto (ANX-28). */
import PaymentMethodIcons from '@/app/components/PaymentMethodIcons';
import TrustIcons from '@/app/components/UI/TrustIcons';
import type { Combo } from '@/app/types/global.types';

interface ComboDetailIslandProps {
  combo: Combo;
}

function ComboDetailContent({ combo }: ComboDetailIslandProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { data: allCombos = [] } = useActiveCombosQuery();
  const others = allCombos.filter((c) => c.id !== combo.id && !c.parentComboId).slice(0, 4);

  // Versiones: combo base + sus versiones (mismo nombre, otros productos/precio).
  const variants = [combo, ...(combo.versions ?? [])];
  const [activeId, setActiveId] = useState<number>(combo.id);
  const active = variants.find((v) => v.id === activeId) ?? combo;

  const products = active.comboProducts ?? [];
  const discount = Number(active.discount ?? 0);
  const listPrice = Number(active.finalPrice);
  const hasDiscount = discount > 0 && Number.isFinite(listPrice);
  const actualPrice = hasDiscount ? listPrice - discount : listPrice;
  const discountPercent = hasDiscount && listPrice > 0 ? Math.round((discount / listPrice) * 100) : 0;

  const comboInStock = products.every((cp) => {
    const prod = cp.product;
    if (!prod) return false;
    const sealedStock = prod.stock ?? 0;
    const openMl = Number(prod.openBottleMlRemaining ?? 0);
    const totalMl = Number(prod.totalMl ?? 0);
    const availableMl = openMl + sealedStock * totalMl;
    if (cp.productVariation) {
      return availableMl >= Number(cp.productVariation.mlSize ?? 0) * cp.quantity;
    }
    return sealedStock >= cp.quantity;
  });

  const originalSum = products.reduce((sum, cp) => {
    const price = Number(cp.productVariation?.price ?? cp.product?.price ?? 0);
    return sum + price * cp.quantity;
  }, 0);
  const savings = originalSum > actualPrice ? originalSum - actualPrice : 0;

  const comboHasBajoPedido = products.some((cp) => cp.product?.bajoPedido);

  const buildComboCartItem = () => {
    const comboProducts = products.map((cp) => {
      const variant = cp.productVariation;
      if (variant) return { productVariationId: parseInt(String(variant.id), 10), quantity: cp.quantity };
      return { productId: parseInt(String(cp.productId), 10), quantity: cp.quantity };
    });
    return {
      productId: `combo-${active.id}`,
      variantId: `combo-${active.id}`,
      name: combo.name,
      image: active.imageUrl || combo.imageUrl || products[0]?.product?.image || '',
      ml: 0,
      price: actualPrice,
      quantity: 1,
      comboId: active.id,
      comboProducts,
      bajoPedido: comboHasBajoPedido,
    };
  };

  const handleAddToCart = (e: { currentTarget: Element }) => {
    const item = buildComboCartItem();
    addItem(item);
    // El carrito lateral se abre solo; el cliente sigue en el combo.
    flyToCart(e.currentTarget, item.image);
  };

  const handleBuyNow = () => {
    addItem(buildComboCartItem());
    window.location.href = '/checkout';
  };

  const handleWhatsapp = () => {
    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://nondecants.com/combo/${combo.id}`;
    const productList = products.map((cp) => cp.product?.name ?? 'Producto').join(', ');
    const msg = `Hola, estoy interesado/a en el combo "${combo.name}" (${productList}): ${url}`;
    window.open(`https://wa.me/593992305463?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-[clamp(24px,4.5vw,72px)]">
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden rounded-md bg-bg-alt md:sticky md:top-24">
        {(active.imageUrl || combo.imageUrl) ? (
          <img src={active.imageUrl || combo.imageUrl} alt={combo.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" />
            </svg>
          </div>
        )}
        {comboHasBajoPedido && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-warning shadow-[0_0_0_1px_var(--color-border)]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Bajo pedido
          </span>
        )}
        {discountPercent > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-text px-2.5 py-1.5 font-body text-[11px] font-semibold text-bg">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <span className="font-body text-[13px] font-semibold text-accent-hover">
          Combo · {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
        <h1 className="mt-1.5 font-display text-4xl leading-[1.0] tracking-[-0.025em] text-text md:text-5xl">
          {combo.name}
        </h1>
        {active.description && (
          <div className="mt-3 max-w-md">
            <p className="line-clamp-4 font-body text-[15px] leading-relaxed text-text-soft">{active.description}</p>
            <a
              href={`/combo/${active.id}`}
              className="mt-2 inline-block font-body text-[13px] font-semibold text-text underline underline-offset-4 transition-colors hover:text-accent-hover"
            >
              Leer más
            </a>
          </div>
        )}

        {/* Selector de versión — mismo combo, otra composición/precio */}
        {variants.length > 1 && (
          <div className="mt-5">
            <span className="font-body text-sm font-semibold text-text">Elige tu versión</span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {variants.map((v, i) => {
                const vDisc = Number(v.discount ?? 0);
                const vList = Number(v.finalPrice);
                const vPrice = vDisc > 0 && Number.isFinite(vList) ? vList - vDisc : vList;
                const isActive = v.id === activeId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveId(v.id)}
                    aria-pressed={isActive}
                    className={`flex flex-col items-start rounded-md border-2 px-3.5 py-2.5 text-left transition-colors ${
                      isActive ? 'border-text bg-gold-light text-text' : 'border-border text-text hover:border-text-muted'
                    }`}
                  >
                    <span className="font-body text-[12.5px] text-text-muted">
                      Opción {i + 1} · {(v.comboProducts ?? []).length} prod
                    </span>
                    <span className="mt-0.5 font-body text-base font-bold leading-none tabular-nums">{formatCurrency(vPrice)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {comboHasBajoPedido && (
          <div className="mt-5 rounded-md bg-gold-light px-4 py-3">
            <p className="font-body text-[15px] text-text-soft">
              <span className="font-semibold text-warning">Bajo pedido ·</span>
              <span className="ml-2 font-semibold text-text">llega en 13–17 días</span>
            </p>
          </div>
        )}

        <div className="my-5 h-px bg-border" />

        {/* Precio */}
        <div className="flex items-baseline gap-3">
          <span className="font-body text-2xl font-bold tabular-nums text-text">{formatCurrency(actualPrice)}</span>
          {hasDiscount && (
            <span className="font-body text-[15px] text-text-muted line-through">{formatCurrency(listPrice)}</span>
          )}
          {discountPercent > 0 && (
            <span className="font-body text-[13px] font-bold text-success">-{discountPercent}%</span>
          )}
        </div>
        {savings > 0 && (
          <p className="mt-2 font-body text-[15px] text-text-soft">
            Por separado: {formatCurrency(originalSum)} · ahorras {formatCurrency(savings)}.
          </p>
        )}

        {/* Incluidos */}
        <div className="mt-5">
          <span className="font-body text-sm font-semibold text-text">Incluye</span>
          <div className="mt-2.5 divide-y divide-border border-y border-border">
            {products.map((cp) => {
              const variant = cp.productVariation;
              const productPrice = Number(variant?.price ?? cp.product?.price ?? 0);
              const img = cp.product?.imageUrl || cp.product?.image || (cp.product as any)?.images?.[0]?.url;
              return (
                <div key={cp.id} className="flex items-center gap-3 py-2">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-border bg-surface">
                    {img ? <img src={img} alt="" className="h-full w-full object-contain p-1" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-text">{cp.product?.name ?? 'Producto'}</p>
                    <p className="font-body text-[13px] text-text-muted">
                      {variant?.mlSize ? `${variant.mlSize}ml · ` : ''}{variant?.isFullBottle ? 'Sellado' : variant?.mlSize ? 'Decant' : ''}
                      {cp.quantity > 1 ? ` · ${cp.quantity}x` : ''}
                    </p>
                  </div>
                  <span className="font-body text-sm tabular-nums text-text-soft">{formatCurrency(productPrice)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            onClick={comboInStock ? handleBuyNow : undefined}
            disabled={!comboInStock}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted"
          >
            <span>{comboInStock ? `Comprar · ${formatCurrency(actualPrice)}` : 'Combo agotado'}</span>
            {comboInStock && <span aria-hidden="true">→</span>}
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={comboInStock ? handleAddToCart : undefined}
              disabled={!comboInStock}
              className="h-[52px] flex-1 rounded-sm border-[1.5px] border-text font-body text-[14.5px] font-semibold text-text transition-colors hover:bg-bg-alt disabled:cursor-not-allowed disabled:opacity-40"
            >
              Agregar al carrito
            </button>
            <button
              onClick={handleWhatsapp}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-sm text-success shadow-[inset_0_0_0_1.5px_var(--color-success)] transition-colors hover:bg-success hover:text-bg"
              aria-label="Consultar por WhatsApp"
              title="Consultar por WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.996 2C6.474 2 2 6.474 2 11.996C2 13.921 2.548 15.717 3.511 17.25L2.146 22.18L7.204 20.852C8.683 21.688 10.297 22.158 11.996 22.158C17.518 22.158 22 17.684 22 12.162C22 6.64 17.518 2.166 11.996 2.166V2ZM17.152 16.315C16.94 16.91 16.1 17.433 15.441 17.545C14.945 17.625 14.284 17.682 11.838 16.669C8.91 15.452 7.027 12.441 6.884 12.253C6.741 12.064 5.72 10.71 5.72 9.31C5.72 7.91 6.442 7.238 6.741 6.93C6.983 6.681 7.404 6.551 7.82 6.551C7.962 6.551 8.089 6.558 8.199 6.564C8.484 6.577 8.627 6.602 8.814 7.051C9.05 7.618 9.623 9.022 9.693 9.172C9.764 9.322 9.851 9.531 9.742 9.742C9.643 9.941 9.551 10.035 9.408 10.203C9.266 10.372 9.13 10.493 8.979 10.672C8.847 10.832 8.694 10.992 8.865 11.282C9.036 11.571 9.625 12.532 10.489 13.303C11.603 14.298 12.51 14.611 12.83 14.743C13.151 14.875 13.34 14.856 13.568 14.613C13.797 14.368 14.441 13.621 14.713 13.313C14.985 13.003 15.241 13.041 15.526 13.144C15.811 13.248 17.324 13.996 17.625 14.145C17.925 14.295 18.125 14.369 18.196 14.494C18.267 14.618 18.267 15.308 17.965 15.939L17.152 16.315Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Garantías + pago — mismos iconos que la ficha de producto. */}
        <div className="mt-5 border-t border-border pt-4">
          <TrustIcons />
        </div>

        <div className="mt-4 border-t border-border pt-4">
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
            const variant = cp.productVariation;
            const price = Number(variant?.price ?? cp.product?.price ?? 0);
            const img = cp.product?.imageUrl || cp.product?.image || (cp.product as any)?.images?.[0]?.url;
            return (
              <article key={cp.id} className="flex flex-col overflow-hidden rounded-sm border border-border bg-surface">
                <div className="relative aspect-square bg-bg-alt">
                  {img ? <img src={img} alt={cp.product?.name ?? ''} loading="lazy" className="h-full w-full object-contain p-4" /> : null}
                  {variant?.mlSize ? (
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-text/90 px-2.5 py-1 font-body text-xs font-bold tabular-nums text-bg">
                      {variant.mlSize} ml
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3.5">
                  <h3 className="font-display text-[19px] leading-tight text-text">{cp.product?.name ?? 'Producto'}</h3>
                  <p className="font-body text-[13px] text-text-muted">
                    {variant?.isFullBottle ? 'Frasco sellado' : variant?.mlSize ? 'Decant original' : ''}
                    {cp.quantity > 1 ? ` · ${cp.quantity}x` : ''}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-body text-sm tabular-nums text-text-soft">Solo: {formatCurrency(price)}</span>
                    {cp.product?.id != null && (
                      <a href={`/producto/${cp.product.id}`} className="font-body text-[13px] font-semibold text-accent-hover hover:underline">
                        Ver ficha →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {originalSum > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border font-body">
            <div className="bg-surface p-3.5 md:p-4">
              <span className="block text-[12.5px] text-text-muted">Por separado</span>
              <s className="text-lg tabular-nums text-text-muted">{formatCurrency(originalSum)}</s>
            </div>
            <div className="bg-surface p-3.5 md:p-4">
              <span className="block text-[12.5px] text-text-muted">En combo</span>
              <b className="text-lg tabular-nums text-text">{formatCurrency(actualPrice)}</b>
            </div>
            <div className="bg-gold-light p-3.5 md:p-4">
              <span className="block text-[12.5px] text-text-muted">Te ahorras</span>
              <b className="text-lg tabular-nums text-success">{formatCurrency(savings)}</b>
            </div>
          </div>
        )}
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

export default function ComboDetailIsland({ combo }: ComboDetailIslandProps) {
  return (
    <AppProviders>
      <ComboDetailContent combo={combo} />
    </AppProviders>
  );
}
