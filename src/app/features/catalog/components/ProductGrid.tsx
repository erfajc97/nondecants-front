import ProductCard from '@/app/features/product/components/ProductCard';
import ProductCardSkeleton from '@/app/components/UI/ProductCardSkeleton';
import type { Product } from '@/app/types/global.types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onClear?: () => void;
}

/** Escritorio 3 columnas (2 bajo 1100 px y en móvil). */
const GRID = 'grid grid-cols-2 gap-2.5 sm:gap-[18px] min-[1100px]:grid-cols-3';

export default function ProductGrid({ products, isLoading, onClear }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 6 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center md:py-20">
        <p className="font-display text-[28px] text-text">Sin resultados</p>
        <p className="mt-2 font-body text-sm text-text-muted">No hay perfumes con esa combinación.</p>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="mt-5 h-11 rounded-full border border-border px-5 font-body text-sm font-semibold text-text transition-colors hover:border-text"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {products.map((product, i) => (
        <div
          key={product.id}
          className="nd-cat-in h-full min-w-0"
          style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
