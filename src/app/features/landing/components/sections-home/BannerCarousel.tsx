import { useState } from 'react';
import CommitmentStrip from './CommitmentStrip';
import { useHeroHook } from '../../hooks/useHeroHook';
import type { Banner } from '@/app/types/global.types';

interface BannerCarouselProps {
  banners: Banner[];
  isLoading?: boolean;
}

type Slide =
  | { kind: 'banner'; banner: Banner };

const HERO_H = 'min-[821px]:h-[clamp(460px,62vh,600px)]';
const BTN =
  'group inline-flex h-[52px] items-center justify-center gap-2.5 self-start whitespace-nowrap rounded-[3px] px-7 font-body text-[14.5px] font-semibold tracking-[0.01em] transition-[background-color,transform] duration-200 active:scale-[0.985]';
const ARROW =
  'absolute top-1/2 z-[3] hidden h-[46px] w-[46px] -translate-y-1/2 place-items-center rounded-full bg-white/90 text-text transition-colors hover:bg-white min-[821px]:grid';

function BannerSlide({ banner, active }: { banner: Banner; active: boolean }) {
  const src = banner.imageUrl ?? banner.image ?? '';
  const alt = banner.title?.trim() || banner.subtitle?.trim() || 'Perfumes originales y decants NonDecants';
  const wrap = `hero-slide ${active ? 'on' : ''} col-start-1 row-start-1 transition-[opacity,visibility] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
    active ? 'visible opacity-100' : 'invisible opacity-0 [transition-delay:0s,0.8s]'
  }`;

  const picture = (
    <picture>
      {banner.mobileImageUrl && <source media="(max-width: 820px)" srcSet={banner.mobileImageUrl} />}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </picture>
  );

  // Solo la imagen que viene del admin, a sangre: sin textos ni elementos encima.
  const body = (
    <div className="hero-photo relative aspect-[1/0.82] w-full overflow-hidden min-[821px]:aspect-auto min-[821px]:h-full">
      {picture}
    </div>
  );
  return (
    <div className={`${wrap} min-[821px]:h-full`} aria-hidden={!active}>
      {banner.link ? (
        <a href={banner.link} tabIndex={active ? 0 : -1} aria-label={alt} className="block h-full">{body}</a>
      ) : body}
    </div>
  );
}

export default function BannerCarousel({ banners, isLoading = false }: BannerCarouselProps) {
  const { sectionsLoading, catalogCount } = useHeroHook();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  if (isLoading || (sectionsLoading && banners.length === 0)) {
    return (
      <section className="flex flex-col bg-bg" aria-hidden="true">
        <div className={`h-[420px] animate-pulse bg-bg-alt ${HERO_H}`} />
        <CommitmentStrip catalogCount={catalogCount} />
      </section>
    );
  }

  const slides: Slide[] = banners.map((banner) => ({ kind: 'banner', banner }) as Slide);
  if (slides.length === 0) return <CommitmentStrip catalogCount={catalogCount} />;

  const count = slides.length;
  const go = (i: number) => setIndex(((i % count) + count) % count);
  const multi = count > 1;
    const onDark = true;

  return (
    <section className="flex flex-col bg-bg" aria-roledescription="carrusel" aria-label="Destacados">
      <div
        className="relative overflow-hidden bg-bg-alt"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className={`grid ${HERO_H}`}>
          {slides.map((s, i) => (
            <BannerSlide key={s.banner.id} banner={s.banner} active={i === index} />
          ))}
        </div>

        {multi && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Anterior" className={`${ARROW} left-3.5`}>
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Siguiente" className={`${ARROW} right-3.5`}>
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
            </button>
            {/* Líneas de progreso: la activa se llena en 6,5 s y al terminar pasa al siguiente slide. */}
            <div className="absolute inset-x-0 bottom-3.5 z-[3] flex justify-center gap-2 min-[821px]:bottom-[22px]">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  aria-current={i === index}
                  className="relative h-[18px] w-9"
                >
                  <span className={`absolute inset-x-0 top-2 h-0.5 ${onDark ? 'bg-white/30' : 'bg-text/20'}`} />
                  <span
                    key={i === index ? `on-${index}` : 'off'}
                    onAnimationEnd={i === index ? () => go(index + 1) : undefined}
                    className={`absolute inset-x-0 top-2 h-0.5 origin-left ${onDark ? 'bg-accent' : 'bg-text'} ${
                      i < index ? 'scale-x-100' : i === index ? 'banner-fill' : 'scale-x-0'
                    } ${i === index && paused ? '[animation-play-state:paused]' : ''}`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <CommitmentStrip catalogCount={catalogCount} />
    </section>
  );
}
