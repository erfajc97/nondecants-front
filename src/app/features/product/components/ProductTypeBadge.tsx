import type { ProductType } from '@/app/types/global.types';

const LABELS: Record<ProductType, string> = {
  SELLADO:   'Sellado',
  DECANT:    'Decant',
  NONDECANT: 'Nondecant',
};

interface ProductTypeBadgeProps {
  type: ProductType;
}

export default function ProductTypeBadge({ type }: ProductTypeBadgeProps) {
  return (
    <span
      className="inline-block px-3 py-1 text-xs font-heading tracking-wider uppercase bg-[--color-accent] text-[--color-bg]"
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      {LABELS[type]}
    </span>
  );
}
