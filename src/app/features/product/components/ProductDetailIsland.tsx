import { useState, useEffect, useMemo, useRef } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import ProductPurchaseOptions from './ProductPurchaseOptions';
import ExclusiveCouponBadge from '@/app/features/coupons/ExclusiveCouponBadge';
import type { Product, ProductVariant } from '@/app/types/global.types';
import '../product-detail.css';

interface ProductDetailIslandProps {
  product: Product;
}

/**
 * Galería del prototipo (.gal): en desktop una cuadrícula de 2 columnas con la
 * primera foto a todo el ancho; en móvil, tiras con scroll-snap (86 %) que
 * sangran hasta el borde derecho. Sin miniaturas: todas las fotos a la vista.
 */
function ProductGallery({
  images,
  name,
  bajoPedido,
  discount,
}: {
  images: string[];
  name: string;
  bajoPedido?: boolean;
  discount?: number;
}) {
  const list = images.filter(Boolean);
  const railRef = useRef<HTMLDivElement>(null);

  // Al cambiar de variante cambia la lista de fotos: volver a la primera.
  useEffect(() => {
    railRef.current?.scrollTo({ left: 0 });
  }, [images]);

  if (list.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded border border-border bg-bg-alt text-text-muted">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  const restIsOdd = (list.length - 1) % 2 === 1;

  return (
    <div
      ref={railRef}
      className="grid grid-cols-2 gap-2.5 max-md:-mr-4 max-md:auto-cols-[86%] max-md:grid-flow-col max-md:grid-cols-none max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:pr-4 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden"
    >
      {list.map((img, i) => {
        const first = i === 0;
        const lastOdd = restIsOdd && i === list.length - 1;
        const wide = first || lastOdd;
        return (
          <div
            key={`${img}-${i}`}
            className={`group relative max-w-full overflow-hidden rounded border border-border bg-white max-md:aspect-square max-md:snap-start ${
              wide ? 'md:col-span-2 md:aspect-square' : 'md:aspect-[4/5]'
            }`}
          >
            <img
              src={img}
              alt={first ? name : `${name} ${i + 1}`}
              draggable={false}
              loading={first ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full select-none object-contain p-[8%] transition-transform duration-700 ease-out md:group-hover:scale-[1.04]"
            />
            {first && bajoPedido && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-2 pr-2.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-warning shadow-[0_0_0_1px_var(--color-border),0_4px_12px_-6px_rgba(27,25,25,0.25)]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Por encargo
              </span>
            )}
            {first && !!discount && discount > 0 && (
              <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1.5 font-body text-[11px] font-bold leading-none text-text">
                -{Math.round(discount)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Island raíz del detalle: necesita AppProviders porque dentro se usan queries
 * de TanStack (p. ej. los días de entrega configurados en el admin).
 */
export default function ProductDetailIsland(props: ProductDetailIslandProps) {
  return (
    <AppProviders>
      <ProductDetailContent {...props} />
    </AppProviders>
  );
}

function ProductDetailContent({ product }: ProductDetailIslandProps) {
  // Default: null = full bottle (product itself), not a variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // When a variant is selected and has images, show those; otherwise show product images
  const galleryImages = useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    const productImages = product.images?.length
      ? product.images
      : [product.image].filter((img): img is string => Boolean(img));
    return productImages;
  }, [selectedVariant, product.images, product.image]);

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-[clamp(24px,4.5vw,72px)]">
      <div className="min-w-0">
        <ProductGallery
          images={galleryImages}
          name={product.name}
          bajoPedido={product.bajoPedido}
          discount={Number(product.discount ?? 0)}
        />
      </div>
      {/* Panel de compra pegajoso (desktop): se queda bajo el header al scrollear. */}
      <div className="grid min-w-0 gap-4 md:sticky md:top-[88px]">
        <ExclusiveCouponBadge productId={product.id} variantId={selectedVariant?.id} />
        <ProductPurchaseOptions
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </div>
  );
}
