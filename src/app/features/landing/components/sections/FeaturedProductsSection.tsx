import ProductCard from '@/app/features/product/components/ProductCard';
import type { Product } from '@/app/types/global.types';

interface FeaturedProductsSectionProps {
  products: Product[];
  isLoading: boolean;
}

const SkeletonCard = () => (
  <div className="flex flex-col bg-[--color-surface] border border-[--color-border] overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
    <div className="aspect-[3/4] bg-[--color-surface-raised] animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-2 bg-[--color-surface-raised] animate-pulse w-1/2 rounded" />
      <div className="h-3 bg-[--color-surface-raised] animate-pulse w-3/4 rounded" />
      <div className="h-3 bg-[--color-surface-raised] animate-pulse w-1/3 rounded" />
      <div className="h-8 bg-[--color-surface-raised] animate-pulse w-full rounded mt-3" />
    </div>
  </div>
);

export default function FeaturedProductsSection({ products, isLoading }: FeaturedProductsSectionProps) {
  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      {/* Header estilo Figma — título izquierda + link derecha */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[--color-text-muted] text-xs uppercase tracking-[0.2em] mb-1">Colección</p>
          <h2 className="font-heading text-3xl md:text-4xl text-[--color-text] uppercase tracking-wide">
            Los más <span className="text-[--color-accent]">vendidos</span>
          </h2>
        </div>
        <a
          href="/catalogo"
          className="hidden sm:flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-[--color-accent] hover:underline underline-offset-4"
        >
          Ver todo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-[--color-text-muted] py-10 text-sm">
          No hay productos disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* CTA mobile */}
      <div className="sm:hidden text-center mt-8">
        <a
          href="/catalogo"
          className="inline-block px-8 py-3 border border-[--color-border-accent] text-[--color-accent] font-heading text-xs uppercase tracking-widest hover:bg-[--color-surface] transition-colors"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          Ver todo el catálogo
        </a>
      </div>
    </section>
  );
}
