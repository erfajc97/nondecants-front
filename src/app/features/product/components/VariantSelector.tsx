import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { ProductVariant } from '@/app/types/global.types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export default function VariantSelector({ variants, selected, onSelect }: VariantSelectorProps) {
  return (
    <div>
      <p className="text-xs font-heading uppercase tracking-wider text-[--color-text-muted] mb-3">
        Tamaño
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const inStock = variant.stock > 0;
          const isSelected = selected?.id === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => inStock && onSelect(variant)}
              disabled={!inStock}
              className={`px-4 py-2 text-sm font-heading uppercase tracking-wider border transition-colors
                ${!inStock
                  ? 'border-[--color-border] text-[--color-text-muted] opacity-40 cursor-not-allowed line-through'
                  : isSelected
                    ? 'border-[--color-accent] bg-[--color-accent] text-[--color-bg]'
                    : 'border-[--color-border] text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-text]'
                }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
              title={!inStock ? 'Sin stock' : `${variant.ml}ml — ${formatCurrency(variant.price)}`}
            >
              {variant.ml}ml
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="mt-2 text-sm text-[--color-text-muted]">
          Precio: <span className="text-[--color-accent] font-medium">{formatCurrency(selected.price)}</span>
          {' '}· Stock: {selected.stock}
        </p>
      )}
    </div>
  );
}
