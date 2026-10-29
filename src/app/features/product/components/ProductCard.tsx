import { useProductCardHook } from '../hooks/useProductCardHook';
import type { Product } from '@/app/types/global.types';
import ExclusiveCouponBadge from '@/app/features/coupons/ExclusiveCouponBadge';
import FormatTiles, { ctaLabel } from './FormatTiles';
import { formatCurrency } from '@/app/helpers/formatCurrency';

interface ProductCardProps {
  product: Product;
}

const PILL =
  'inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-2 pr-2.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] shadow-[0_0_0_1px_var(--color-border),0_4px_12px_-6px_rgba(27,25,25,0.25)]';
const PILL_DOT = "before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-['']";

export default function ProductCard({ product }: ProductCardProps) {
  const c = useProductCardHook(product);
  const {
    formats,
    selected,
    displayImage,
    hoverImage,
    productUrl,
    detailUrl,
    canPurchase,
    isNew,
    hasDiscount,
    discount,
    basePrice,
    finalPrice,
  } = c;

  // Máx. 4 tiles: hasta 3 decants + el frasco (que siempre se ve).
  const decants = formats.filter((f) => !f.isFullBottle);
  const bottle = formats.find((f) => f.isFullBottle);
  const chipFormats = [...decants.slice(0, bottle ? 3 : 4), ...(bottle ? [bottle] : [])];
  const hasMoreFormats = formats.length > chipFormats.length;

  const brandName = product.marca?.name ?? '';

  return (
    <article className="group/card flex h-full min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-white transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_18px_40px_-28px_rgba(27,25,25,0.4)]">
      {/* Imagen — tile cuadrado; 1ª de galería + 2ª al hover en desktop. */}
      <div data-card-media className="relative aspect-square overflow-hidden border-b border-border bg-white">
        <a href={productUrl} className="relative block h-full w-full">
          {displayImage ? (
            <>
              <img
                data-gallery-role="principal"
                src={displayImage}
                alt={product.name}
                loading="lazy"
                className={`h-full w-full object-contain p-[9%] transition-[transform,opacity] duration-700 ease-out group-hover/card:scale-[1.04] ${
                  hoverImage ? 'md:group-hover/card:opacity-0' : ''
                }`}
              />
              {hoverImage && (
                <img
                  data-gallery-role="hover"
                  src={hoverImage}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain p-[9%] opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover/card:scale-[1.04] md:group-hover/card:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </a>

        {/* Etiquetas: píldoras del prototipo (NUEVO negro, estados en blanco con punto) */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-[2] flex flex-col items-start gap-[5px]">
          {product.bajoPedido ? (
            <span className={`${PILL} ${PILL_DOT} text-warning`}>Por encargo</span>
          ) : c.decantsSoldOut ? (
            <span className={`${PILL} ${PILL_DOT} text-text-muted`}>Decants agotados</span>
          ) : null}
          {isNew && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-text py-1.5 pl-2 pr-2.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
              <span className="text-[10px] text-accent" aria-hidden>✦</span>Nuevo
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-text py-1.5 pl-2 pr-2.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
              <span className="text-[10px] text-accent" aria-hidden>✦</span>-{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3.5">
        <ExclusiveCouponBadge productId={product.id} className="mb-1" />
        {brandName && (
          <span className="font-body text-xs font-medium text-text-muted">{brandName}</span>
        )}
        <a href={productUrl}>
          <h3 className="line-clamp-2 min-h-[2.3em] font-display text-base font-normal leading-[1.15] tracking-normal text-text transition-colors group-hover/card:text-accent-hover sm:text-[19px]">
            {product.name}
          </h3>
        </a>

        {/* Tamaños: ml + precio del formato; seleccionan y actualizan el CTA. */}
        {chipFormats.length > 0 && (
          <div className="mt-3">
            <FormatTiles
              formats={chipFormats}
              selectedId={selected?.id}
              onSelect={c.setSelectedId}
              applyDiscount={c.applyDiscount}
            />
          </div>
        )}
        {hasMoreFormats && (
          <a
            href={detailUrl}
            aria-label="Ver todos los formatos"
            className="mt-1.5 font-body text-xs font-semibold text-accent-hover underline underline-offset-2"
          >
            Ver todos los formatos
          </a>
        )}
        {hasDiscount && (
          <span className="mt-1 font-body text-xs text-text-muted line-through">{formatCurrency(basePrice)}</span>
        )}

        <div className="mt-auto pt-2">
        {canPurchase ? (
          <button
            type="button"
            onClick={c.handleQuickAdd}
            className="inline-flex h-11 w-full items-center justify-center rounded-[3px] bg-text px-2.5 font-body text-xs font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97] sm:h-[46px] sm:text-[13px]"
          >
            {ctaLabel(c.ctaIsBackorder, finalPrice)}
          </button>
        ) : (
          <span className="flex h-11 w-full items-center justify-center rounded-[3px] bg-bg-alt px-2.5 font-body text-xs font-semibold text-text-muted sm:h-[46px] sm:text-[13px]">
            No disponible
          </span>
        )}
        </div>
      </div>
    </article>
  );
}
