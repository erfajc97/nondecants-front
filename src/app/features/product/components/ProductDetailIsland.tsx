import { useState, useEffect, useMemo, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AppProviders from '@/app/providers/AppProviders';
import ProductPurchaseOptions from './ProductPurchaseOptions';
import ExclusiveCouponBadge from '@/app/features/coupons/ExclusiveCouponBadge';
import { EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import type { Product, ProductVariant } from '@/app/types/global.types';

interface ProductDetailIslandProps {
  product: Product;
}

function ProductGallery({
  images,
  name,
  bajoPedido,
}: {
  images: string[];
  name: string;
  bajoPedido?: boolean;
}) {
  const list = images.filter(Boolean);
  const [idx, setIdx] = useState(0);

  /* Arrastre real —con el dedo y con el mouse— en vez del swipe casero, que
     solo reaccionaba al soltar y se perdía si el gesto empezaba sobre la foto. */
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: list.length > 1,
    align: 'start',
    containScroll: false,
    duration: EMBLA_DURATION,
  });

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setIdx(emblaApi.selectedScrollSnap());
    sync();
    emblaApi.on('select', sync);
    emblaApi.on('reInit', sync);
    return () => {
      emblaApi.off('select', sync);
      emblaApi.off('reInit', sync);
    };
  }, [emblaApi]);

  // Al cambiar de variante cambia la lista de fotos: volver a la primera.
  useEffect(() => {
    emblaApi?.reInit();
    emblaApi?.scrollTo(0, true);
  }, [emblaApi, images]);

  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (list.length === 0) {
    return (
      <div className="flex h-[55svh] items-center justify-center bg-surface-raised text-text-muted">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    /* Galería compacta. En MÓVIL se limita a ~42svh y se navega con swipe +
       puntos (sin miniaturas); en desktop usa el alto grande con miniaturas. */
    <div className="flex h-[42svh] flex-col gap-2.5 sm:h-[50svh] md:h-[calc(100svh-15rem)] md:max-h-[620px]">
      {/* Imagen principal — botella completa sobre tile blanco (object-contain) */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {list.map((img, i) => (
              <div key={i} className="h-full min-w-0 shrink-0 basis-full">
                <img
                  src={img}
                  alt={i === 0 ? name : `${name} ${i + 1}`}
                  draggable={false}
                  className="h-full w-full select-none object-contain p-3 md:p-4"
                />
              </div>
            ))}
          </div>
        </div>
        {bajoPedido && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 border border-accent bg-bg px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.22em] text-text md:left-5 md:top-5">
            <span className="h-[5px] w-[5px] rounded-full bg-accent" />
            Bajo Pedido
          </span>
        )}
      </div>
      {/* Puntos del carrusel — solo mobile, bajo la imagen sobre fondo claro */}
      {list.length > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-1.5 py-1 md:hidden">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Imagen ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === i ? 'w-4 bg-text' : 'w-1.5 bg-text/30'
              }`}
            />
          ))}
        </div>
      )}
      {/* Miniaturas cuadradas — solo desktop */}
      {list.length > 1 && (
        <div className="hidden w-full max-w-82.5 shrink-0 grid-cols-3 gap-2.5 md:grid">
          {list.slice(0, 3).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`relative aspect-square overflow-hidden border bg-white transition-colors ${
                idx === i ? 'border-text' : 'border-border opacity-90 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
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
    <div className="mt-4 grid grid-cols-1 items-start gap-8 md:grid-cols-[0.82fr_1fr] md:gap-12">
      <div className="max-w-full overflow-hidden">
        <ProductGallery images={galleryImages} name={product.name} bajoPedido={product.bajoPedido} />
      </div>
      <div className="md:sticky md:top-20">
        <ExclusiveCouponBadge productId={product.id} variantId={selectedVariant?.id} className="mb-3" />
        <ProductPurchaseOptions
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </div>
  );
}
