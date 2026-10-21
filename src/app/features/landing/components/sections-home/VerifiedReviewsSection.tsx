import { useLatestReviewsQuery } from '@/app/tanstack-queries/reviewsQuery';
import ReviewCard from '@/app/features/reviews/components/ReviewCard';

/**
 * Últimas reseñas aprobadas de todos los productos (más recientes primero).
 * Si todavía no hay ninguna aprobada, no se pinta nada.
 */
export default function VerifiedReviewsSection() {
  const { data: reviews = [] } = useLatestReviewsQuery(6);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-bg px-6 py-10 md:px-14 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-3xl font-light leading-none tracking-[-0.02em] text-text md:text-5xl">
          Lo que dicen nuestros clientes.
        </h2>
        <p className="mt-3 font-body text-[13px] text-text-soft md:text-sm">
          Reseñas de compradores verificados.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} showProduct />
          ))}
        </div>
      </div>
    </section>
  );
}
