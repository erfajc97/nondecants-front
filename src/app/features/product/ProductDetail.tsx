import AppProviders from '@/app/providers/AppProviders';
import { useProductDetailHook } from './hooks/useProductDetailHook';
import ProductImages from './components/ProductImages';
import ProductInfo from './components/ProductInfo';

interface ProductDetailProps {
  productId: string;
}

function ProductDetailContent({ productId }: ProductDetailProps) {
  const {
    product,
    isLoading,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    handleAddToCart,
  } = useProductDetailHook(productId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-[--color-surface] animate-pulse rounded-[--radius-md]" />
        <div className="space-y-4">
          {[80, 40, 60, 100, 120].map((w, i) => (
            <div key={i} className="h-4 bg-[--color-surface] animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-[--color-text-muted]">Producto no encontrado.</p>
        <a href="/catalogo" className="mt-4 inline-block text-[--color-accent] text-sm hover:underline">
          Volver al catálogo
        </a>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs text-[--color-text-muted] flex items-center gap-2">
        <a href="/" className="hover:text-[--color-accent] transition-colors">Inicio</a>
        <span>›</span>
        <a href="/catalogo" className="hover:text-[--color-accent] transition-colors">Catálogo</a>
        <span>›</span>
        <span className="text-[--color-text]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductImages images={images} name={product.name} />
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onVariantSelect={setSelectedVariant}
          onQtyChange={setQuantity}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  return (
    <AppProviders>
      <ProductDetailContent productId={productId} />
    </AppProviders>
  );
}
