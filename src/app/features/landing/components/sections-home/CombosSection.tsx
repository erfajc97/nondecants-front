import useEmblaCarousel from 'embla-carousel-react';
import ComboCard from '@/app/features/combos/components/ComboCard';
import { useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import { useActiveCombosQuery } from '@/app/tanstack-queries/combosQuery';
import SectionHead, { RoundArrow, PillLink } from '../shared/SectionHead';
import Reveal from '../shared/Reveal';

/* Riel del prototipo (.combo-rail): 80 % en móvil, 3 columnas hasta 1180 px y
   4 en desktop; gap de 18 px. */
const SLIDE_CLS =
  'min-w-0 shrink-0 basis-[80%] pl-2.5 min-[821px]:basis-1/3 min-[821px]:pl-[18px] min-[1181px]:basis-1/4';

/** "Combos NonDecants": combos activos del admin en un riel con flechas. */
export default function CombosSection() {
  const { data: combos = [] } = useActiveCombosQuery();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    duration: EMBLA_DURATION,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 821px)': { slidesToScroll: 3 },
      '(min-width: 1181px)': { slidesToScroll: 4 },
    },
  });
  const { canPrev, canNext, scrollPrev, scrollNext } = useCarouselNav(emblaApi);

  if (combos.length === 0) return null;

  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal>
          <SectionHead
            eyebrow="Decants que se llevan juntos"
            title="Combos NonDecants"
            right={
              <>
                <RoundArrow direction="prev" onClick={scrollPrev} disabled={!canPrev} label="Anterior" />
                <RoundArrow direction="next" onClick={scrollNext} disabled={!canNext} label="Siguiente" />
                <span className="max-md:hidden"><PillLink href="/catalogo/combos">Ver todos →</PillLink></span>
              </>
            }
          />
          <div className="-mr-[max(16px,3.4vw)] overflow-hidden min-[821px]:mr-0" ref={emblaRef}>
            <div className="-ml-2.5 flex min-[821px]:-ml-[18px]">
              {combos.map((combo) => (
                <div key={combo.id} className={SLIDE_CLS}>
                  <ComboCard combo={combo} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 text-center min-[821px]:hidden">
            <PillLink href="/catalogo/combos">Ver todos →</PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
