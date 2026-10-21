import StarRating from '@/app/features/landing/components/StarRating';
import type { Review } from '../types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
}

export default function ReviewCard({ review, showProduct = false }: ReviewCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 border border-border bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} size={16} />
        <span className="font-body text-[11px] text-text-muted">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {showProduct && review.productName && (
        <a
          href={`/producto/${review.productId}`}
          className="font-display text-xl font-light leading-tight text-text hover:underline"
        >
          {review.productName}
        </a>
      )}

      <p className="font-body text-[13px] leading-relaxed text-text-soft whitespace-pre-line">
        {review.comment}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2">
        <span className="font-body text-xs font-medium text-text">
          {review.customerName}
        </span>
        {review.variantLabel && (
          <span className="font-body text-[11px] text-text-muted">
            {review.variantLabel}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-[0.18em] text-text-muted">
          <span className="h-[5px] w-[5px] rounded-full bg-accent" />
          Compra verificada
        </span>
      </div>
    </article>
  );
}
