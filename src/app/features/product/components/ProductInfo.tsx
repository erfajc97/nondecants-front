import { formatCurrency } from '@/app/helpers/formatCurrency';
import ProductTypeBadge from './ProductTypeBadge';
import VariantSelector from './VariantSelector';
import AddToCartButton from './AddToCartButton';
import type { Product, ProductVariant } from '@/app/types/global.types';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  quantity: number;
  onVariantSelect: (variant: ProductVariant) => void;
  onQtyChange: (qty: number) => void;
  onAddToCart: () => void;
}

export default function ProductInfo({
  product,
  selectedVariant,
  quantity,
  onVariantSelect,
  onQtyChange,
  onAddToCart,
}: ProductInfoProps) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceRange = minPrice === maxPrice
    ? formatCurrency(minPrice)
    : `${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`;

  return (
    <div className="space-y-6">
      <div>
        <ProductTypeBadge type={product.type} />
        <p className="mt-3 text-sm text-[--color-text-muted] uppercase tracking-widest">{product.brand}</p>
        <h1 className="mt-1 font-heading text-3xl md:text-4xl text-[--color-text] uppercase leading-tight">
          {product.name}
        </h1>
        <p className="mt-3 font-heading text-2xl text-[--color-accent]">{priceRange}</p>
      </div>

      {product.description && (
        <p className="text-sm text-[--color-text-muted] leading-relaxed">{product.description}</p>
      )}

      <VariantSelector
        variants={product.variants}
        selected={selectedVariant}
        onSelect={onVariantSelect}
      />

      {/* Cantidad */}
      <div>
        <p className="text-xs font-heading uppercase tracking-wider text-[--color-text-muted] mb-3">Cantidad</p>
        <div className="flex items-center gap-0">
          <button
            onClick={() => onQtyChange(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center border border-r-0 border-[--color-border] text-[--color-text-muted] hover:text-[--color-text] transition-colors"
            style={{ borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
          >
            −
          </button>
          <span className="w-12 h-10 flex items-center justify-center border-y border-[--color-border] text-sm text-[--color-text] select-none">
            {quantity}
          </span>
          <button
            onClick={() => onQtyChange(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center border border-l-0 border-[--color-border] text-[--color-text-muted] hover:text-[--color-text] transition-colors"
            style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton onClick={onAddToCart} disabled={!selectedVariant} />

      {/* Info adicional */}
      <div className="border-t border-[--color-border] pt-4 space-y-1 text-xs text-[--color-text-muted]">
        <p>Envíos vía Servientrega a todo Ecuador.</p>
        <p>Pago con Payphone o transferencia bancaria.</p>
      </div>
    </div>
  );
}
