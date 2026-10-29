import { useState } from 'react';
import { productUrl as productUrlHelper } from '@/app/helpers/productUrl';
import { useCartStore, type CartItem } from '@/app/store/cart/cartStore';
import { flyToCart } from '@/app/helpers/flyToCart';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { Product } from '@/app/types/global.types';

export interface CardFormat {
  id: string;
  ml: number;
  price: number;
  isFullBottle: boolean;
  imageUrl?: string;
  /** Decant sin ml suficientes (no se puede preparar nunca bajo pedido). */
  soldOut: boolean;
  /** Frasco que no hay en stock: se trae bajo pedido. */
  backorder: boolean;
  /** 0–1: nivel de existencias, para la franja dorada del tile. */
  level: number;
}

const NEW_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

/**
 * Estado y lógica de compra de una card de producto (formatos, selección,
 * stock, carrito). Lo comparten ProductCard y el bloque "destacado de la casa".
 *
 * Reglas de negocio (no cambian): los decants NUNCA van bajo pedido (tope = ml
 * disponibles); el frasco SIEMPRE se puede pedir (sin stock → bajo pedido).
 */
export function useProductCardHook(product: Product) {
  const addItem = useCartStore((s) => s.addItem);

  const productImages = (product.images ?? [])
    .map((img: any) => (typeof img === 'string' ? img : img.url))
    .filter(Boolean)
    .filter((url, i, arr) => arr.indexOf(url) === i);
  const productImage = productImages[0] || product.image || product.imageUrl;

  const sealedStock = Number(product.stock ?? 0);
  const openMl = Number(product.openBottleMlRemaining ?? 0);
  const totalMl = Number(product.totalMl ?? 0);
  const availableMl = openMl + sealedStock * totalMl;
  const hasStock = sealedStock > 0 || availableMl > 0;
  const fullIsBackorder = !!product.bajoPedido || sealedStock <= 0;

  const discount = product.discount ?? 0;
  const hasDiscount = discount > 0;
  const applyDiscount = (n: number) => (hasDiscount ? n * (1 - discount / 100) : n);

  const variants = product.variants ?? [];
  const rawFormats = (
    product.formats && product.formats.length
      ? product.formats
      : variants.map((v) => ({
          id: v.id,
          ml: v.ml,
          price: v.price,
          isFullBottle: v.isFullBottle,
          imageUrl: v.images?.[0],
        }))
  ).filter((f) => f.ml > 0 || f.price > 0);

  // Decants por ml ascendente y el frasco al final (como el prototipo).
  const formats: CardFormat[] = rawFormats
    .slice()
    .sort((a, b) => {
      if (a.isFullBottle !== b.isFullBottle) return a.isFullBottle ? 1 : -1;
      return a.ml - b.ml;
    })
    .map((f) => {
      const units = f.ml > 0 ? Math.floor(availableMl / f.ml) : 0;
      return {
        ...f,
        soldOut: !f.isFullBottle && units < 1,
        backorder: f.isFullBottle && fullIsBackorder,
        level: f.isFullBottle
          ? Math.min(1, Math.max(0.15, sealedStock / 5))
          : Math.min(1, Math.max(0.15, totalMl > 0 ? availableMl / (totalMl * 2) : 0.3)),
      };
    });

  const decants = formats.filter((f) => !f.isFullBottle);
  const decantsSoldOut = decants.length > 0 && decants.every((f) => f.soldOut);
  const firstAvailable = formats.find((f) => !f.soldOut) ?? formats[0] ?? null;

  const [selectedId, setSelectedId] = useState<string | null>(firstAvailable?.id ?? null);
  const selected = formats.find((f) => f.id === selectedId) ?? firstAvailable;

  const basePrice = selected?.price ?? product.minFormatPrice ?? product.price ?? 0;
  const finalPrice = applyDiscount(basePrice);

  const formatImage = selected && !selected.isFullBottle ? selected.imageUrl : undefined;
  const displayImage = formatImage || productImage;
  const hoverImage = formatImage ? undefined : productImages[1];

  const productUrl = productUrlHelper(product);
  const detailUrl = selected ? `${productUrl}?variant=${selected.id}` : productUrl;
  const canPurchase = product.isPurchasable !== false;

  const isNew =
    !!product.createdAt && Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_MS;

  const buildCartItem = (): CartItem | null => {
    const image = displayImage || '';

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

    const ordered = selected ? [selected, ...formats.filter((f) => f.id !== selected.id)] : formats;

    for (const f of ordered) {
      if (f.price <= 0) continue;
      if (f.isFullBottle) return buildFull(f.price);
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

    const price = product.price ?? basePrice;
    return price > 0 ? buildFull(price) : null;
  };

  const handleQuickAdd = (e?: { currentTarget: Element }) => {
    if (!canPurchase) return;
    const item = buildCartItem();
    if (!item) {
      window.location.href = productUrl;
      return;
    }
    addItem(item);
    flyToCart(e?.currentTarget ?? null, item.image);
    sonnerResponse(`${product.name} · ${item.ml} ml añadido al carrito.`, 'success');
  };

  return {
    formats,
    selected,
    setSelectedId,
    decantsSoldOut,
    hasStock,
    isNew,
    hasDiscount,
    discount,
    basePrice,
    finalPrice,
    applyDiscount,
    displayImage,
    hoverImage,
    productUrl,
    detailUrl,
    canPurchase,
    handleQuickAdd,
    /** El CTA pide el frasco bajo pedido ("Pedir frasco · $x"). */
    ctaIsBackorder: !!selected?.backorder,
  };
}
