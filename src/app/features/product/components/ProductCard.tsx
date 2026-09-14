import { useState } from 'react';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { productUrl as productUrlHelper } from '@/app/helpers/productUrl';
import { useCartStore, type CartItem } from '@/app/store/cart/cartStore';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { Product } from '@/app/types/global.types';

interface ProductCardProps {
  product: Product;
}

interface Format {
  id: string;
  ml: number;
  price: number;
  isFullBottle: boolean;
  imageUrl?: string;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  // Galería del producto: [0] principal, [1] hover. La foto del decant
  // (formato) solo entra cuando el chip elegido no es el frasco.
  const productImages = (product.images ?? [])
    .map((img: any) => (typeof img === 'string' ? img : img.url))
    .filter(Boolean)
    .filter((url, i, arr) => arr.indexOf(url) === i);
  const productImage = productImages[0] || product.image || product.imageUrl;

  const variants = product.variants ?? [];
  // Formatos: preferir la lista compacta del backend; si no, derivar de las
  // variantes cargadas (mock / detalle). Orden: botella completa primero y
  // luego decants por ml ascendente — el frasco arranca seleccionado.
  const formats: Format[] = (product.formats && product.formats.length
    ? product.formats
    : variants.map((v) => ({
        id: v.id,
        ml: v.ml,
        price: v.price,
        isFullBottle: v.isFullBottle,
        imageUrl: v.images?.[0],
      }))
  )
    .filter((f) => f.ml > 0 || f.price > 0)
    .slice()
    .sort((a, b) => {
      if (a.isFullBottle !== b.isFullBottle) return a.isFullBottle ? -1 : 1;
      return a.ml - b.ml;
    });

  // Formato elegido desde la propia card: cambia el precio sin salir de aquí.
  const [selectedId, setSelectedId] = useState<string | null>(formats[0]?.id ?? null);
  const selected = formats.find((f) => f.id === selectedId) ?? formats[0] ?? null;

  const sealedStock = Number(product.stock ?? 0);
  const openMl = Number(product.openBottleMlRemaining ?? 0);
  const totalMl = Number(product.totalMl ?? 0);
  const availableMl = openMl + sealedStock * totalMl;
  const hasStock = sealedStock > 0 || availableMl > 0;

  const discount = product.discount ?? 0;
  const hasDiscount = discount > 0;
  const applyDiscount = (n: number) => (hasDiscount ? n * (1 - discount / 100) : n);

  // Precio del formato seleccionado (antes se mostraba el rango del producto).
  const basePrice = selected?.price ?? product.minFormatPrice ?? product.price ?? 0;
  const finalPrice = applyDiscount(basePrice);

  const formatImage =
    selected && !selected.isFullBottle ? selected.imageUrl : undefined;
  const displayImage = formatImage || productImage;
  const hoverImage = formatImage ? undefined : productImages[1];

  // Máximo 2 formatos como chips; el "+" solo aparece si hay más de 2.
  const chipFormats = formats.slice(0, 2);
  const hasMoreFormats = formats.length > 2;

  const productUrl = productUrlHelper(product);
  // El "+" abre el detalle ya posicionado en el formato elegido aquí.
  const detailUrl = selected ? `${productUrl}?variant=${selected.id}` : productUrl;

  /** Item de carrito del formato elegido en la card. */
  const buildCartItem = (): CartItem | null => {
    const image = displayImage || '';
    const fullIsBackorder = !!product.bajoPedido || sealedStock <= 0;

    const buildFull = (price: number): CartItem => ({
      productId: product.id,
      variantId: `full-${product.id}`,
      name: product.name,
      image,
      ml: totalMl,
      price: applyDiscount(price),
      quantity: 1,
      bajoPedido: fullIsBackorder,
      // El frasco no tiene tope: el excedente se desglosa como bajo pedido.
      maxQty: undefined,
      stockAvailable: fullIsBackorder ? undefined : sealedStock,
      availableMl,
    });

    // Se intenta el formato elegido y, si no se puede preparar, los siguientes.
    const ordered = selected ? [selected, ...formats.filter((f) => f.id !== selected.id)] : formats;

    for (const f of ordered) {
      if (f.price <= 0) continue;
      if (f.isFullBottle) return buildFull(f.price);
      // Decant: topado por los ml disponibles del producto.
      const maxQty = f.ml > 0 ? Math.floor(availableMl / f.ml) : 0;
      if (maxQty < 1) continue;
      return {
        productId: product.id,
        variantId: f.id,
        name: product.name,
        image,
        ml: f.ml,
        price: applyDiscount(f.price),
        quantity: 1,
        bajoPedido: false,
        maxQty,
        availableMl,
      };
    }

    // Sin decants preparables: queda el frasco (siempre comprable si hay precio).
    const price = product.price ?? basePrice;
    return price > 0 ? buildFull(price) : null;
  };

  const canPurchase = product.isPurchasable !== false;

  const handleQuickAdd = () => {
    if (!canPurchase) return;
    const item = buildCartItem();
    if (!item) {
      window.location.href = productUrl;
      return;
    }
    addItem(item);
    sonnerResponse(`${product.name} · ${item.ml} ml añadido al carrito.`, 'success');
  };

  return (
    <div className="group/card flex h-full flex-col bg-white">
      {/* Imagen — tile blanco cuadrado; 1ª de galería + 2ª al hover en desktop. */}
      <div data-card-media className="relative aspect-square overflow-hidden bg-white">
        <a href={productUrl} className="relative block h-full w-full">
          {displayImage ? (
            <>
              <img
                data-gallery-role="principal"
                src={displayImage}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain p-3 sm:p-4"
              />
              {hoverImage && (
                <img
                  data-gallery-role="hover"
                  src={hoverImage}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain p-3 opacity-0 transition-opacity duration-200 sm:p-4 md:group-hover/card:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </a>

        {hasDiscount && (
          <span className="absolute left-3 top-3 bg-accent px-2.5 py-1 font-body text-[9px] font-medium uppercase tracking-[0.18em] text-bg">
            -{discount}%
          </span>
        )}

        {/* Añadir al carrito: visible siempre (no solo hover). */}
        {canPurchase ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="gold-frame absolute inset-x-0 bottom-0 z-10 bg-text py-2.5 font-body text-[10px] uppercase tracking-[0.18em] text-white transition-[background-color,color] duration-150 hover:bg-bg hover:text-text"
          >
            Agregar al carrito
          </button>
        ) : (
          <span className="absolute inset-x-0 bottom-0 z-10 bg-bg-alt py-2.5 text-center font-body text-[10px] uppercase tracking-[0.18em] text-text-muted">
            No disponible
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
        <a href={productUrl}>
          {/* Altura mínima de 2 líneas: los nombres largos ya no desalinean
              los chips de formato entre cards vecinas */}
          <h3 className="line-clamp-2 min-h-[2.75em] font-display text-[15px] font-normal leading-snug tracking-[-0.005em] text-text transition-colors group-hover/card:text-accent">
            {product.name}
          </h3>
        </a>

        {/* Precio del formato elegido + estado */}
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
          <span className="font-body text-[11px] tracking-[0.02em] text-text">
            {hasDiscount && (
              <span className="mr-1.5 text-text-muted line-through">{formatCurrency(basePrice)}</span>
            )}
            {formatCurrency(finalPrice)}
          </span>
          <span
            className={`shrink-0 font-body text-[9px] uppercase tracking-[0.16em] ${
              product.bajoPedido ? 'text-accent' : hasStock ? 'text-text-muted' : 'text-error'
            }`}
          >
            {product.bajoPedido ? 'Bajo pedido' : hasStock ? 'En stock' : 'Sin stock'}
          </span>
        </div>

        {/* Chips de formato (máx 2): seleccionan y actualizan el precio aquí
            mismo. El "+" (solo con más de 2 formatos) abre el detalle.
            `mt-auto` los fija al pie de la card para que queden alineados
            entre cards de la misma fila. */}
        {chipFormats.length > 0 && (
          <div className="mt-auto flex flex-nowrap items-center gap-1.5 pt-0.5">
            {chipFormats.map((f) => {
              const isSelected = selected?.id === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  aria-pressed={isSelected}
                  className={`border px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.08em] transition-colors ${
                    isSelected
                      ? 'border-text bg-text text-bg'
                      : 'border-border text-text-soft hover:border-text hover:text-text'
                  }`}
                >
                  {f.ml} ml
                </button>
              );
            })}
            {hasMoreFormats && (
              <a
                href={detailUrl}
                aria-label="Ver todos los formatos"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-soft transition-colors hover:border-text hover:text-text"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
