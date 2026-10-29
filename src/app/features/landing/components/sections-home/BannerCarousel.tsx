import { useRef, useState } from 'react';
import CommitmentStrip from './CommitmentStrip';
import NodSeal from '@/app/components/UI/NodSeal';
import './home.css';
import { useHeroHook } from '../../hooks/useHeroHook';
import { bannerSrcSet, BANNER_SIZES } from '@/app/helpers/responsiveImage';
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

/** Parte el título en [inicio, destacado]: la 2ª parte va en dorado itálico. */
function splitTitle(title: string, highlight?: string): [string, string] {
  const hl = highlight?.trim();
  if (!hl) return [title, ''];
  const at = title.lastIndexOf(hl);
  if (at === -1) return [`${title} `, hl];
  return [title.slice(0, at), title.slice(at, at + hl.length) + title.slice(at + hl.length)];
}

function BannerSlide({ banner, active, first }: { banner: Banner; active: boolean; first: boolean }) {
  const src = banner.imageUrl ?? banner.image ?? '';
  const alt = banner.title?.trim() || banner.subtitle?.trim() || 'Perfumes originales y decants NonDecants';
  const wrap = `nd-hero-slide ${active ? 'on' : ''} col-start-1 row-start-1 transition-[opacity,visibility] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
    active ? 'visible opacity-100' : 'invisible opacity-0 [transition-delay:0s,0.8s]'
  }`;

  const picture = (
    <picture>
      {banner.mobileImageUrl && <source media="(max-width: 820px)" srcSet={banner.mobileImageUrl} />}
      <img
        src={src}
        srcSet={bannerSrcSet(src)}
        sizes={BANNER_SIZES}
        alt={alt}
        className="h-full w-full object-cover"
        loading={first ? 'eager' : 'lazy'}
        decoding={first ? 'sync' : 'async'}
        {...(first ? { fetchpriority: 'high' } : {})}
      />
    </picture>
  );

  const hasCopy = Boolean(banner.eyebrow || banner.paragraph || banner.highlight || banner.bgColor);

  // Banner sin texto (datos antiguos): solo la imagen a sangre, como antes.
  if (!hasCopy) {
    const body = (
      <div className="nd-hero-photo relative aspect-[1/0.82] w-full overflow-hidden min-[821px]:aspect-auto min-[821px]:h-full">
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

  const dark = banner.theme === 'dark';
  const [lead, tail] = splitTitle(banner.title ?? '', banner.highlight);
  const paragraph = banner.paragraph ?? banner.subtitle;
  const ctaCls = dark
    ? 'bg-accent text-text hover:bg-accent/85'
    : 'bg-text text-bg hover:bg-text-soft';

  return (
    <div
      className={`${wrap} flex flex-col min-[821px]:grid min-[821px]:h-full min-[821px]:grid-cols-2`}
      style={banner.bgColor ? { backgroundColor: banner.bgColor } : undefined}
      aria-hidden={!active}
    >
      <div className="nd-hero-photo relative order-first h-[clamp(230px,60vw,330px)] overflow-hidden min-[821px]:order-last min-[821px]:h-full">
        {picture}
        {banner.showSeal && (
          <NodSeal size={104} className="absolute bottom-3.5 left-3.5 z-[2] min-[821px]:bottom-6 min-[821px]:left-6" />
        )}
      </div>
      <div className="flex flex-1 items-center px-[max(16px,3.4vw)] pb-14 pt-7 min-[821px]:py-0 min-[821px]:pr-12">
        <div className="nd-hero-copy flex max-w-[34rem] flex-col items-start gap-3.5 min-[821px]:gap-[18px]">
          {banner.eyebrow && (
            <span className={`eyebrow k ${dark ? '!text-accent' : ''}`}>{banner.eyebrow}</span>
          )}
          <h2
            className={`font-display text-[clamp(34px,4.4vw,64px)] font-normal leading-[0.98] tracking-[-0.025em] text-balance ${
              dark ? 'text-bg' : 'text-text'
            }`}
          >
            {lead}
            {tail && <em className={dark ? 'text-accent' : 'text-accent-hover'}>{tail}</em>}
          </h2>
          {paragraph && (
            <p className={`max-w-[42ch] font-body text-[15px] leading-relaxed min-[821px]:text-[17px] ${dark ? 'text-bg/80' : 'text-text-soft'}`}>
              {paragraph}
            </p>
          )}
          {banner.buttonText && banner.link && (
            <a href={banner.link} tabIndex={active ? 0 : -1} className={`${BTN} mt-1 ${ctaCls}`}>
              {banner.buttonText}
              <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BannerCarousel({ banners, isLoading = false }: BannerCarouselProps) {
  const { sectionsLoading, catalogCount } = useHeroHook();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

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
  // Las barras de progreso toman el color del tema del slide activo.
  const current = slides[index % count].banner;
  const onDark = current.theme === 'dark' || !(current.eyebrow || current.paragraph || current.highlight || current.bgColor);

  // Swipe horizontal > 40 px cambia de slide (el scroll vertical no se toca).
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (multi && Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="flex flex-col bg-bg" aria-roledescription="carrusel" aria-label="Destacados">
      <div
        className="relative overflow-hidden bg-bg-alt"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={`grid ${HERO_H}`}>
          {slides.map((s, i) => (
            <BannerSlide key={s.banner.id} banner={s.banner} active={i === index} first={i === 0} />
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
            <div className="absolute bottom-3.5 left-[max(16px,3.4vw)] z-[3] flex gap-2 min-[821px]:bottom-[22px]">
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
