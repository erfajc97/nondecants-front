import ProductCard from '@/app/features/product/components/ProductCard';
import type { Product } from '@/app/types/global.types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
}

export default function ProductGrid({ products, isLoading, isFetching }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-[--color-surface] animate-pulse" style={{ borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[--color-text-muted] text-sm">No se encontraron productos con esos filtros.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
