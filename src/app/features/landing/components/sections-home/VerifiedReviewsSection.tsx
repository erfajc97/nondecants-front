import useEmblaCarousel from 'embla-carousel-react';
import { useLatestReviewsQuery } from '@/app/tanstack-queries/reviewsQuery';
import { useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import SectionHead, { RoundArrow } from '../shared/SectionHead';
import Reveal from '../shared/Reveal';
import type { Review } from '@/app/features/reviews/types';

const SLIDE_CLS =
  'min-w-0 shrink-0 basis-[83%] pl-3 min-[560px]:basis-1/2 min-[1181px]:basis-1/4 min-[1181px]:pl-[18px]';

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
    .replace('.', '');

const initials = (name: string) =>
  name
    .replace(/\./g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || 'C';

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-accent" role="img" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`${className} ${i < Math.round(rating) ? 'opacity-100' : 'opacity-25'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function Summary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: reviews.filter((r) => Math.round(r.rating) === n).length,
  }));
  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-12 gap-y-6">
      <div>
        <div className="font-display text-[clamp(64px,7vw,92px)] font-normal leading-[0.9] tracking-[-0.03em] text-text">
          {avg.toFixed(1).replace('.', ',')}
        </div>
        <div className="mt-2.5">
          <Stars rating={avg} />
        </div>
        <div className="mt-2 font-body text-[15px] text-text-muted">
          {total} {total === 1 ? 'reseña' : 'reseñas'}
        </div>
      </div>
      <ul className="m-0 flex w-full max-w-[440px] list-none flex-col gap-2 p-0 max-[560px]:max-w-none">
        {counts.map(({ n, c }) => (
          <li key={n} className="flex items-center gap-3 font-body text-[13px] text-text-muted">
            <span className="w-7 shrink-0">{n} ★</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${(c / total) * 100}%` }}
              />
            </span>
            <span className="w-5 shrink-0 text-right tabular-nums">{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewTile({ review }: { review: Review }) {
  const product = [review.productName, review.variantLabel].filter(Boolean).join(' · ');
  return (
    <article className="flex h-full flex-col rounded-[4px] border border-border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <span className="whitespace-nowrap font-body text-[13px] font-semibold text-success">
          ✓ Compra verificada
        </span>
      </div>
      <p className="mt-5 font-body text-[16px] leading-[1.65] text-text-soft whitespace-pre-line">
        “{review.comment}”
      </p>
      {product && (
        <p className="mt-4 font-body text-[14px] font-semibold leading-snug text-accent-hover">
          {product}
        </p>
      )}
      <div className="mt-auto flex items-center gap-3 pt-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream font-body text-[13px] font-bold text-text-muted">
          {initials(review.customerName)}
        </span>
        <div className="min-w-0">
          <div className="truncate font-body text-[15px] font-bold text-text">{review.customerName}</div>
          <div className="font-body text-[14px] text-text-muted">{formatDate(review.createdAt)}</div>
        </div>
      </div>
    </article>
  );
}

/**
 * Reseñas verificadas (propias) en el home: resumen + carrusel de tarjetas.
 * Si todavía no hay ninguna aprobada, no se pinta nada.
 */
export default function VerifiedReviewsSection() {
  // El backend limita a 24.
  const { data: reviews = [] } = useLatestReviewsQuery(24);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    duration: EMBLA_DURATION,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 560px)': { slidesToScroll: 2 },
      '(min-width: 1181px)': { slidesToScroll: 4 },
    },
  });
  const { canPrev, canNext, scrollPrev, scrollNext } = useCarouselNav(emblaApi);

  if (reviews.length === 0) return null;

  return (
    <section id="resenas" className="sec bg-bg-alt py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal>
          <SectionHead
            eyebrow="Reseñas"
            title="Lo que dicen quienes ya probaron"
            right={
              <>
                <RoundArrow direction="prev" onClick={scrollPrev} disabled={!canPrev} label="Anterior" />
                <RoundArrow direction="next" onClick={scrollNext} disabled={!canNext} label="Siguiente" />
              </>
            }
          />
          <Summary reviews={reviews} />
          <div className="-mr-[max(16px,3.4vw)] overflow-hidden min-[1181px]:mr-0" ref={emblaRef}>
            <div className="-ml-3 flex min-[1181px]:-ml-[18px]">
              {reviews.map((r) => (
                <div key={r.id} className={SLIDE_CLS}>
                  <ReviewTile review={r} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
