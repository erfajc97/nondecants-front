import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AppProviders from '@/app/providers/AppProviders';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import SectionHead, { RoundArrow } from '@/app/features/landing/components/shared/SectionHead';
import { useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import { useAuthStore } from '@/app/store/auth/authStore';
import {
  useCanReviewQuery,
  useProductReviewsQuery,
} from '@/app/tanstack-queries/reviewsQuery';
import { useCreateReviewMutation } from '../mutations/useCreateReviewMutation';
import Stars from './Stars';
import type { Review } from '../types';
import '@/app/features/product/product-detail.css';

interface ProductReviewsProps {
  productId: number | string;
  /** Nombre del perfume, para el título "Opiniones de …". */
  productName?: string;
}

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

export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-colors ${
            n <= value ? 'text-accent' : 'text-border'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId }: { productId: number | string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [authOpen, setAuthOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { data: can, isLoading } = useCanReviewQuery(productId, isAuthenticated);
  const create = useCreateReviewMutation();

  const box = 'rounded-sm border border-border bg-bg-alt p-5 md:p-6';

  if (!isAuthenticated) {
    return (
      <div className={box}>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="font-body text-sm text-text underline underline-offset-4 hover:text-text-soft"
        >
          Inicia sesión para dejar tu reseña
        </button>
        <AuthModalIsland open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  if (isLoading || !can) return null;

  if (!can.canReview) {
    const msg =
      can.reason === 'already_reviewed'
        ? can.status === 'pending'
          ? 'Ya enviaste tu reseña de este producto. Está pendiente de aprobación.'
          : 'Ya dejaste tu reseña de este producto.'
        : 'Solo puedes reseñar productos que hayas comprado.';
    return (
      <div className={box}>
        <p className="font-body text-sm text-text-muted">{msg}</p>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || comment.trim().length < 3) return;
    create.mutate({ productId: Number(productId), rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={submit} className={`${box} flex flex-col gap-4`}>
      <p className="font-body text-sm font-semibold text-text">
        Deja tu reseña
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
        required
        placeholder="Cuéntanos tu experiencia con este perfume"
        className="w-full rounded-[3px] border border-border bg-white p-3 font-body text-sm text-text outline-none focus:border-text"
      />
      <button
        type="submit"
        disabled={create.isPending || rating < 1 || comment.trim().length < 3}
        className="self-start rounded-[3px] bg-text px-6 py-3 font-body text-sm font-semibold text-white transition-[opacity,background-color] hover:bg-[#34312f] disabled:opacity-40"
      >
        {create.isPending ? 'Enviando…' : 'Enviar reseña'}
      </button>
    </form>
  );
}

/** Resumen del prototipo (.revhead): nota grande + estrellas + barras por puntaje. */
function Summary({ reviews, average, count }: { reviews: Review[]; average: number; count: number }) {
  const total = reviews.length || 1;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: reviews.filter((r) => Math.round(r.rating) === n).length,
  }));
  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-12 gap-y-6">
      <div>
        <div className="font-display text-[clamp(64px,7vw,92px)] font-normal leading-[0.9] tracking-[-0.03em] text-text">
          {average.toFixed(1).replace('.', ',')}
        </div>
        <div className="mt-2.5">
          <Stars rating={average} />
        </div>
        <div className="mt-2 font-body text-[15px] text-text-muted">
          {count} {count === 1 ? 'reseña' : 'reseñas'}
        </div>
      </div>
      <ul className="m-0 flex w-full max-w-[440px] list-none flex-col gap-2 p-0 max-[560px]:max-w-none">
        {counts.map(({ n, c }) => (
          <li key={n} className="flex items-center gap-3 font-body text-[13px] text-text-muted">
            <span className="w-7 shrink-0">{n} ★</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
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
  return (
    <article className="pdp-lift flex h-full flex-col rounded-[4px] border border-border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <span className="whitespace-nowrap font-body text-[13px] font-semibold text-success">
          ✓ Compra verificada
        </span>
      </div>
      <p className="mt-5 whitespace-pre-line font-body text-[16px] leading-[1.65] text-text-soft">
        “{review.comment}”
      </p>
      {review.variantLabel && (
        <p className="mt-4 font-body text-[14px] font-semibold leading-snug text-accent-hover">
          {review.variantLabel}
        </p>
      )}
      <div className="mt-auto flex items-center gap-3 pt-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-light font-body text-[13px] font-bold text-accent-hover">
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

function ProductReviewsContent({ productId, productName }: ProductReviewsProps) {
  const { data: queried } = useProductReviewsQuery(productId);
  // La caché de reseñas se comparte con la ficha (otra isla) y puede llegar ya
  // llena: se pinta tras montar para que coincida con el HTML del servidor.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = mounted ? queried : undefined;
  const reviews = data?.reviews ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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

  const toggleForm = () => {
    const next = !formOpen;
    setFormOpen(next);
    if (next) {
      requestAnimationFrame(() =>
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      );
    }
  };

  return (
    <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
      <SectionHead
        className="max-sm:flex-col max-sm:items-start"
        eyebrow="Reseñas"
        title={productName ? `Opiniones de ${productName}` : 'Opiniones'}
        right={
          <>
            {reviews.length > 0 && (
              <>
                <RoundArrow direction="prev" onClick={scrollPrev} disabled={!canPrev} label="Anterior" />
                <RoundArrow direction="next" onClick={scrollNext} disabled={!canNext} label="Siguiente" />
              </>
            )}
            <button
              type="button"
              onClick={toggleForm}
              aria-expanded={formOpen}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-text px-[18px] font-body text-[13px] font-semibold text-text transition-colors hover:bg-text hover:text-bg"
            >
              {formOpen ? 'Cerrar' : 'Escribir una reseña'}
            </button>
          </>
        }
      />

      {data && data.count > 0 && reviews.length > 0 ? (
        <>
          <Summary reviews={reviews} average={data.average} count={data.count} />
          <div className="-mr-[max(16px,3.4vw)] overflow-hidden min-[1181px]:mr-0" ref={emblaRef}>
            <div className="-ml-3 flex min-[1181px]:-ml-[18px]">
              {reviews.map((r) => (
                <div key={r.id} className={SLIDE_CLS}>
                  <ReviewTile review={r} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="py-6 text-left font-body text-[15px] text-text-muted">
          Sé el primero en dejar una reseña. Las compras verificadas pueden dejar la primera.
        </p>
      )}

      {/* Formulario: se abre con "Escribir una reseña" (misma lógica de antes). */}
      <div
        ref={formRef}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          formOpen ? 'mt-8 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!formOpen}
      >
        <div className="overflow-hidden">
          <div className="max-w-xl">{formOpen && <ReviewForm productId={productId} />}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProductReviews(props: ProductReviewsProps) {
  return (
    <AppProviders>
      <ProductReviewsContent {...props} />
    </AppProviders>
  );
}
