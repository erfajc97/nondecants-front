import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '@/app/features/product/components/ProductCard';
import ProductCardSkeleton from '@/app/components/UI/ProductCardSkeleton';
import { useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import SectionHead, { RoundArrow, PillLink } from '../shared/SectionHead';
import type { Product } from '@/app/types/global.types';

interface ProductCarouselSectionProps {
  title: string;
  products: Product[];
  isLoading?: boolean;
  showCTA?: boolean;
  /** Ruta del enlace "Ver todo" */
  viewAllHref?: string;
  /** Posición de la sección (no se pinta; se conserva por compatibilidad). */
  num?: string;
  /** Texto del eyebrow "✦ …" sobre el título. */
  eyebrow?: string;
}

/* Columnas del prototipo: 47 % en móvil (se asoma la siguiente), 4 desde 821 px
   y 5 desde 1181 px; gap de 18 px. */
const SLIDE_CLS =
  'min-w-0 shrink-0 basis-[47%] pl-2.5 min-[821px]:basis-1/4 min-[821px]:pl-[18px] min-[1181px]:basis-1/5';

export default function ProductCarouselSection({
  title,
  products,
  isLoading = false,
  showCTA = false,
  viewAllHref = '/catalogo',
  eyebrow = 'Selección de la casa',
}: ProductCarouselSectionProps) {
  // El paso de la flecha = las tarjetas visibles: 2 en móvil, 4 en tablet y 5
  // en desktop (mismo corte que el basis de cada slide). Se fija por
  // breakpoint en vez de `slidesToScroll: 'auto'` porque 'auto' hacía que la
  // última página avanzara una distancia distinta —el "salto" del final—.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    duration: EMBLA_DURATION,
    containScroll: 'trimSnaps',
    slidesToScroll: 2,
    breakpoints: {
      '(min-width: 821px)': { slidesToScroll: 4 },
      '(min-width: 1181px)': { slidesToScroll: 5 },
    },
  });
  const { canPrev, canNext, scrollPrev, scrollNext } = useCarouselNav(emblaApi);

  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        {isLoading ? (
          <>
            <div className="mb-6 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded-sm bg-bg-alt" />
              <div className="h-9 w-56 animate-pulse rounded-sm bg-bg-alt md:h-11 md:w-80" />
            </div>
            {/* Mismo ancho por slide que el carrusel cargado: nada salta. */}
            <div className="-ml-2.5 flex overflow-hidden min-[821px]:-ml-[18px]">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={SLIDE_CLS}>
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <SectionHead
              eyebrow={eyebrow}
              title={title}
              right={
                <>
                  <RoundArrow direction="prev" onClick={scrollPrev} disabled={!canPrev} label="Anterior" />
                  <RoundArrow direction="next" onClick={scrollNext} disabled={!canNext} label="Siguiente" />
                  <span className="max-md:hidden"><PillLink href={viewAllHref}>Ver más →</PillLink></span>
                </>
              }
            />

            {products.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-muted">
                No hay productos disponibles.
              </p>
            ) : (
              /* En móvil el riel sangra hasta el borde de la pantalla, como en
                 el prototipo, para que se vea que hay más cards. */
              <div
                className="-mr-[max(16px,3.4vw)] overflow-hidden min-[821px]:mr-0"
                ref={emblaRef}
              >
                <div className="-ml-2.5 flex min-[821px]:-ml-[18px]">
                  {products.map((p) => (
                    <div key={p.id} className={SLIDE_CLS}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA móvil */}
        {(showCTA || (!isLoading && products.length > 0)) && (
          <div className="mt-6 text-center min-[821px]:hidden">
            <PillLink href={viewAllHref}>{showCTA ? "Ver todo el catálogo" : "Ver más →"}</PillLink>
          </div>
        )}
      </div>
    </section>
  );
}
