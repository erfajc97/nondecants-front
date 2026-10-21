import { useState } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import StarRating from '@/app/features/landing/components/StarRating';
import { useAuthStore } from '@/app/store/auth/authStore';
import {
  useCanReviewQuery,
  useProductReviewsQuery,
} from '@/app/tanstack-queries/reviewsQuery';
import { useCreateReviewMutation } from '../mutations/useCreateReviewMutation';
import ReviewCard from './ReviewCard';

interface ProductReviewsProps {
  productId: number | string;
}

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

  const box = 'border border-border bg-surface-raised p-5 md:p-6';

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
      <p className="font-body text-xs uppercase tracking-[0.18em] text-text-muted">
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
        className="w-full border border-border bg-surface p-3 font-body text-sm text-text outline-none focus:border-text"
      />
      <button
        type="submit"
        disabled={create.isPending || rating < 1 || comment.trim().length < 3}
        className="self-start bg-text px-6 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-bg transition-opacity disabled:opacity-40"
      >
        {create.isPending ? 'Enviando…' : 'Enviar reseña'}
      </button>
    </form>
  );
}

function ProductReviewsContent({ productId }: ProductReviewsProps) {
  const { data } = useProductReviewsQuery(productId);
  const reviews = data?.reviews ?? [];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-14 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-light leading-none tracking-[-0.02em] text-text md:text-4xl">
          Reseñas.
        </h2>
        {data && data.count > 0 && (
          <div className="flex items-center gap-3">
            <StarRating rating={data.average} size={18} />
            <span className="font-body text-sm text-text-soft">
              {data.average.toFixed(1)} · {data.count}{' '}
              {data.count === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <p className="mt-6 font-body text-sm text-text-muted">
          Aún no hay reseñas de este producto.
        </p>
      )}

      <div className="mt-8 max-w-xl">
        <ReviewForm productId={productId} />
      </div>
    </section>
  );
}

export default function ProductReviews(props: ProductReviewsProps) {
  return (
    <AppProviders>
      <ProductReviewsContent {...props} />
    </AppProviders>
  );
}
