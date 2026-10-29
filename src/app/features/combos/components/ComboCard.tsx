import { formatCurrency } from '@/app/helpers/formatCurrency';
import { flyToCart } from '@/app/helpers/flyToCart';
import { useCartStore } from '@/app/store/cart/cartStore';
import type { Combo } from '@/app/types/global.types';

interface ComboCardProps {
  combo: Combo;
}

function comboInStock(combo: Combo): boolean {
  const products = combo.comboProducts ?? [];
  return products.every((cp) => {
    const prod = cp.product;
    if (!prod) return false;
    const sealedStock = prod.stock ?? 0;
    const openMl = Number(prod.openBottleMlRemaining ?? 0);
    const totalMl = Number(prod.totalMl ?? 0);
    const availableMl = openMl + sealedStock * totalMl;
    if (cp.productVariation) {
      return availableMl >= Number(cp.productVariation.mlSize ?? 0) * cp.quantity;
    }
    return sealedStock >= cp.quantity;
  });
}

export default function ComboCard({ combo }: ComboCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const comboImage = combo.imageUrl;
  const products = combo.comboProducts ?? [];

  const discount = Number(combo.discount ?? 0);
  const listPrice = Number(combo.finalPrice);
  const hasDiscount = discount > 0 && Number.isFinite(listPrice);
  const actualPrice = hasDiscount ? listPrice - discount : listPrice;

  // "Por separado": suma de los productos; si no supera el precio del combo no se muestra ahorro.
  const originalSum = products.reduce((sum, cp) => {
    const price = Number(cp.productVariation?.price ?? cp.product?.price ?? 0);
    return sum + price * cp.quantity;
  }, 0);
  const wasPrice = hasDiscount ? listPrice : originalSum;
  const savings = wasPrice > actualPrice ? wasPrice - actualPrice : 0;

  const inStock = comboInStock(combo);
  const hasBajoPedido = products.some((cp) => cp.product?.bajoPedido);

  const handleAdd = (e: { currentTarget: Element }) => {
    const comboProducts = products.map((cp) => {
      const variant = cp.productVariation;
      if (variant) return { productVariationId: parseInt(String(variant.id), 10), quantity: cp.quantity };
      return { productId: parseInt(String(cp.productId), 10), quantity: cp.quantity };
    });
    const image = combo.imageUrl || products[0]?.product?.image || '';
    addItem({
      productId: `combo-${combo.id}`,
      variantId: `combo-${combo.id}`,
      name: combo.name,
      image,
      ml: 0,
      price: actualPrice,
      quantity: 1,
      comboId: combo.id,
      comboProducts,
      bajoPedido: hasBajoPedido,
    });
    // El carrito lateral se abre solo; el cliente sigue en el catálogo.
    flyToCart(e.currentTarget, image);
  };

  return (
    <article className="group/card flex min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-surface">
      {/* Imagen */}
      <a href={`/combo/${combo.id}`} className="relative block aspect-square overflow-hidden bg-bg-alt">
        {comboImage ? (
          <img
            src={comboImage}
            alt={combo.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover/card:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" />
            </svg>
          </div>
        )}
        {products.length > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-text/90 px-2.5 py-1 font-body text-xs font-bold tracking-[0.04em] text-bg">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
        )}
        {(!inStock || hasBajoPedido) && (
          <span
            className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] shadow-[0_0_0_1px_var(--color-border)] ${
              inStock ? 'text-warning' : 'text-text-muted'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {inStock ? 'Bajo pedido' : 'Agotado'}
          </span>
        )}
      </a>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 md:p-4">
        {products.length > 0 && (
          <span className="font-body text-[12.5px] text-text-muted">
            {products.length} {products.length === 1 ? 'producto original' : 'productos originales'}
          </span>
        )}

        <h3 className="font-display text-xl leading-[1.05] text-text md:text-[25px]">
          <a href={`/combo/${combo.id}`} className="transition-colors hover:text-accent-hover">
            {combo.name}
          </a>
        </h3>

        {products.length > 0 && (
          <ul className="hidden gap-[3px] font-body text-[13.5px] text-text-soft md:grid">
            {products.slice(0, 4).map((cp) => (
              <li key={cp.id} className="flex items-baseline">
                <span aria-hidden="true" className="mr-[7px] text-[10px] text-accent">✦</span>
                <span className="truncate">{cp.product?.name ?? 'Producto'}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2.5 gap-y-1 pt-1.5 tabular-nums">
          <b className="font-body text-lg font-bold text-text md:text-xl">{formatCurrency(actualPrice)}</b>
          {savings > 0 && (
            <>
              <s className="font-body text-[13px] text-text-muted">{formatCurrency(wasPrice)}</s>
              <em className="font-body text-xs font-bold not-italic text-success">
                Ahorras {formatCurrency(savings)}
              </em>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={inStock ? handleAdd : undefined}
          disabled={!inStock}
          className="flex h-11 w-full items-center justify-center rounded-sm bg-text px-3 font-body text-[13.5px] font-semibold text-bg transition-colors hover:bg-text-soft disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted md:h-[46px]"
        >
          {inStock ? (<span className="whitespace-nowrap">Agregar<span className="hidden md:inline"> combo</span> · {formatCurrency(actualPrice)}</span>) : 'Combo agotado'}
        </button>
        <a
          href={`/combo/${combo.id}`}
          className="self-center font-body text-[13.5px] font-semibold text-accent-hover hover:underline hover:underline-offset-[3px]"
        >
          Ver qué trae →
        </a>
      </div>
    </article>
  );
}
