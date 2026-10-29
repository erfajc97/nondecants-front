import { useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useLandingSectionsActiveQuery } from '@/app/tanstack-queries/landingSectionsQuery';
import ProductCard from '@/app/features/product/components/ProductCard';
import ProductCardSkeleton from '@/app/components/UI/ProductCardSkeleton';
import {
  useCarouselNav,
  useMediaCenterTop,
  CarouselArrow,
  EMBLA_DURATION,
} from '@/app/components/UI/CarouselNav';
import CarouselProgressTrack from '@/app/components/UI/CarouselProgressTrack';
import type { Product } from '@/app/types/global.types';

/**
 * "No te pierdas estos productos" — publicidad de productos al pie del
 * carrito. Los productos salen de las secciones que el admin marcó con
 * ubicación "carrito" (mismo CRUD que las secciones de la landing).
 *
 * Antes se cortaba en los primeros 4: el resto de lo que el admin ponía en la
 * sección no se veía nunca. Ahora entran todos y se recorren con flechas, de a
 * una pantalla (2 en móvil, 3 en tablet, 4 en desktop).
 */
export default function CartRecommendations() {
  const { data: sections = [], isLoading } = useLandingSectionsActiveQuery('cart');

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    duration: EMBLA_DURATION,
    containScroll: 'trimSnaps',
    slidesToScroll: 2,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    },
  });
  const { canPrev, canNext, progress, snapCount, scrollPrev, scrollNext, seekRatio } =
    useCarouselNav(emblaApi);

  const viewportRef = useRef<HTMLDivElement>(null);

  // Una sola fila: se juntan las secciones de carrito y se quitan repetidos.
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const section of [...sections].sort((a, b) => a.order - b.order)) {
    for (const product of section.products ?? []) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      products.push(product);
    }
  }

  const arrowTop = useMediaCenterTop(viewportRef, isLoading ? 0 : products.length);

  // Esqueleto mientras llegan las secciones: mismo ancho por slide que el
  // carrusel cargado, así nada salta al aparecer los productos.
  if (isLoading) {
    return (
      <section className="mt-12 border-t border-border pt-10 md:mt-14 md:pt-12" aria-hidden="true">
        <div className="mb-6 h-6 w-56 animate-pulse rounded-sm bg-surface-raised md:mb-8" />
        <div className="flex gap-5 overflow-hidden md:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="shrink-0 basis-[calc(50%-0.625rem)] md:basis-1/3 lg:basis-1/4">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const title = sections[0]?.title || 'No te pierdas estos productos';

  return (
    <section className="mt-12 border-t border-border pt-10 md:mt-14 md:pt-12">
      <div className="mb-6 flex items-baseline justify-between md:mb-8">
        <h2 className="font-display text-[26px] leading-none text-text md:text-3xl">{title}</h2>
        <a
          href="/catalogo/perfumes"
          className="hidden font-body text-[13.5px] font-semibold text-text underline underline-offset-4 transition-colors hover:text-accent-hover sm:inline-block"
        >
          Ver todo
        </a>
      </div>

      <div className="relative" ref={viewportRef}>
        {/* Las flechas solo aparecen cuando hay más de una pantalla que
            recorrer: con 4 productos o menos el carrusel no se mueve. */}
        {snapCount > 1 && (
          <CarouselArrow
            direction="prev"
            onClick={scrollPrev}
            disabled={!canPrev}
            top={arrowTop}
            className="absolute left-0 top-[34%] -translate-y-1/2"
          />
        )}

        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {products.map((product) => (
              <div
                key={product.id}
                className="shrink-0 basis-1/2 pr-5 md:basis-1/3 md:pr-6 lg:basis-1/4"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {snapCount > 1 && (
          <CarouselArrow
            direction="next"
            onClick={scrollNext}
            disabled={!canNext}
            top={arrowTop}
            className="absolute right-0 top-[34%] -translate-y-1/2"
          />
        )}

        {snapCount > 1 && (
          <CarouselProgressTrack
            progress={progress}
            snapCount={snapCount}
            onSeek={seekRatio}
            emblaApi={emblaApi}
            className="mt-5 md:mt-7"
          />
        )}
      </div>
    </section>
  );
}
