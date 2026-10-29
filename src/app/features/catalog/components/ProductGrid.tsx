import ProductCard from '@/app/features/product/components/ProductCard';
import ProductCardSkeleton from '@/app/components/UI/ProductCardSkeleton';
import type { Product } from '@/app/types/global.types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  hideEmpty?: boolean;
}

export default function ProductGrid({ products, isLoading, isFetching, hideEmpty = false }: ProductGridProps) {
  if (isLoading) {
    // 8 = LIMIT del catálogo: el grid ya ocupa su altura final al cargar.
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:gap-[18px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    if (hideEmpty) return null;
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center md:py-20">
        <p className="font-display text-[28px] text-text">Sin resultados</p>
        <p className="mt-2 font-body text-sm text-text-muted">
          No se encontraron productos con esos filtros.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-2.5 sm:gap-[18px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${
        isFetching ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
