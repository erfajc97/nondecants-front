import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from './ProductCard';
import CarouselProgressTrack from '@/app/components/UI/CarouselProgressTrack';
import { useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import SectionHead, { RoundArrow, PillLink } from '@/app/features/landing/components/shared/SectionHead';
import type { Product } from '@/app/types/global.types';

interface ExploreCategoriesCarouselProps {
  products: Product[];
  /** Destino del "Ver más →" (catálogo filtrado por la misma casa). */
  moreHref?: string;
}

/**
 * "De la misma familia · También te puede gustar" (prototipo railSec): cabecera
 * con flechas redondas y pastilla "Ver más", y el mismo ProductCard del catálogo.
 */
export default function ExploreCategoriesCarousel({ products, moreHref }: ExploreCategoriesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    duration: EMBLA_DURATION,
  });
  const { canPrev, canNext, progress, snapCount, scrollPrev, scrollNext, seekRatio } =
    useCarouselNav(emblaApi);

  if (products.length === 0) return null;

  return (
    <section>
      <SectionHead
        eyebrow="De la misma familia"
        title="También te puede gustar"
        right={
          <>
            <RoundArrow direction="prev" onClick={scrollPrev} disabled={!canPrev} label="Anterior" />
            <RoundArrow direction="next" onClick={scrollNext} disabled={!canNext} label="Siguiente" />
            {moreHref && <PillLink href={moreHref}>Ver más →</PillLink>}
          </>
        }
      />

      <div className="-mr-[max(16px,3.4vw)] overflow-hidden min-[1181px]:mr-0" ref={emblaRef}>
        <div className="-ml-[9px] flex">
          {products.map((product) => (
            <div key={product.id} className="shrink-0 basis-[47%] pl-[9px] min-[820px]:basis-1/4 min-[1181px]:basis-1/5">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <CarouselProgressTrack
        progress={progress}
        snapCount={snapCount}
        onSeek={seekRatio}
        emblaApi={emblaApi}
        className="mt-5 md:mt-7"
      />
    </section>
  );
}
