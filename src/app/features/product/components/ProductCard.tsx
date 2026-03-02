import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { Product } from '@/app/types/global.types';

const TYPE_LABELS: Record<string, string> = {
  SELLADO:   'Sellado',
  DECANT:    'Decant',
  NONDECANT: 'Nondecant',
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const prices   = product.variants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const hasStock = product.variants.some(v => v.stock > 0);
  const priceLabel = minPrice === maxPrice
    ? formatCurrency(minPrice)
    : `${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`;

  return (
    <article className="group flex flex-col bg-[--color-surface] border border-[--color-border] hover:border-[--color-accent] transition-all duration-300 overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>

      {/* Imagen */}
      <a href={`/producto/${product.id}`} className="block relative overflow-hidden bg-[--color-bg]" style={{ aspectRatio: '3/4' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[--color-text-muted]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Overlay gradiente bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Badge tipo */}
        <span
          className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-heading tracking-widest uppercase bg-[--color-accent] text-[--color-bg]"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          {TYPE_LABELS[product.type] ?? product.type}
        </span>
      </a>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <p className="text-[10px] text-[--color-text-muted] uppercase tracking-[0.15em]">
          {product.brand}
        </p>
        <h3 className="font-heading text-sm text-[--color-text] uppercase leading-snug line-clamp-2 tracking-wide">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-[10px] text-[--color-text-muted]">Desde</span>
          <span className="font-heading text-base text-[--color-accent]">{priceLabel}</span>
        </div>

        <a
          href={`/producto/${product.id}`}
          className={`mt-auto block w-full text-center py-2.5 font-heading text-xs uppercase tracking-widest transition-colors
            ${hasStock
              ? 'bg-[--color-accent] text-[--color-bg] hover:bg-[--color-accent-hover]'
              : 'bg-transparent border border-[--color-border] text-[--color-text-muted] cursor-not-allowed pointer-events-none'
            }`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          {hasStock ? 'Ver producto' : 'Sin stock'}
        </a>
      </div>
    </article>
  );
}
