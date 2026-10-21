import { useState } from 'react';
import { useMyReviewsQuery } from '@/app/tanstack-queries/reviewsQuery';
import { useCreateReviewMutation } from '../mutations/useCreateReviewMutation';
import { StarPicker } from './ProductReviews';

interface PanelItem {
  id: number;
  productId?: number;
  productName?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Reseña pendiente de aprobación',
  approved: 'Reseña publicada',
  rejected: 'Reseña no aprobada',
};

function ReviewRow({ item, status }: { item: PanelItem; status?: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const create = useCreateReviewMutation();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || comment.trim().length < 3) return;
    create.mutate(
      { productId: Number(item.productId), rating, comment: comment.trim() },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-text">{item.productName || 'Producto'}</p>
        {status ? (
          <span className="shrink-0 font-body text-xs text-text-muted">
            {STATUS_LABEL[status] ?? status}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 border border-border px-4 py-1.5 font-body text-xs uppercase tracking-[0.14em] text-text transition-colors hover:border-text"
          >
            {open ? 'Cerrar' : 'Calificar'}
          </button>
        )}
      </div>
      {open && !status && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
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
      )}
    </div>
  );
}

/** Lista cada producto de una orden pagada para calificarlo (incluye bajo pedido y combos). */
export default function OrderReviewsPanel({ items }: { items: PanelItem[] }) {
  const { data: mine = [], isLoading } = useMyReviewsQuery(true);
  const seen = new Set<number>();
  const unique = items.filter((i) => {
    if (!i.productId || seen.has(i.productId)) return false;
    seen.add(i.productId);
    return true;
  });
  if (unique.length === 0 || isLoading) return null;
  const byProduct = new Map(mine.map((r) => [r.productId, r.status]));

  return (
    <div className="space-y-2">
      <span className="eyebrow block">Califica tus compras</span>
      <div className="divide-y divide-border border border-border">
        {unique.map((i) => (
          <ReviewRow key={i.productId} item={i} status={byProduct.get(Number(i.productId))} />
        ))}
      </div>
    </div>
  );
}
