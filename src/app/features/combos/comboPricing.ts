import type { Combo, ComboProduct, Product } from '@/app/types/global.types';
import type { CartItem } from '@/app/store/cart/cartStore';

/**
 * Un combo se vende en 3 versiones (3, 5 y 10 ml por perfume). La base y sus
 * `versions` se aplanan en una lista por tamaño: precio, "antes" (suma de los
 * decants de ese tamaño) y ahorro. Si el combo no trae decants (datos viejos),
 * queda un único tamaño `ml = 0` y el selector no se pinta.
 */
export interface ComboSize {
  ml: number;
  /** Versión del combo que corresponde a este tamaño (id real para el backend). */
  combo: Combo;
  products: ComboProduct[];
  /** Cantidad total de decants (suma de cantidades). */
  decants: number;
  /** ml totales de la caja (decants × ml). */
  totalMl: number;
  price: number;
  /** Suma de cada decant por separado en este tamaño. */
  before: number;
  savings: number;
  pct: number;
  inStock: boolean;
  hasBajoPedido: boolean;
}

type Loose = Record<string, any>;

/** Lista de formatos de un producto, acepte la forma cruda (`variations`) o la mapeada (`variants`). */
function productFormats(product?: Product): Loose[] {
  const p = product as Loose | undefined;
  return (p?.variants ?? p?.variations ?? []) as Loose[];
}

const sizeOf = (v?: Loose): number => Number(v?.mlSize ?? v?.ml ?? 0);

/** Precio del decant de `ml` para un perfume del combo. */
function decantPrice(cp: ComboProduct, ml: number): number {
  const own = cp.productVariation as Loose | undefined;
  if (own && sizeOf(own) === ml && !own.isFullBottle) return Number(own.price ?? 0);
  const found = productFormats(cp.product).find((v) => !v.isFullBottle && sizeOf(v) === ml);
  return Number(found?.price ?? own?.price ?? cp.product?.price ?? 0);
}

function inStockOf(products: ComboProduct[]): boolean {
  return products.every((cp) => {
    const prod = cp.product;
    if (!prod) return false;
    const sealedStock = prod.stock ?? 0;
    const openMl = Number((prod as Loose).openBottleMlRemaining ?? 0);
    const totalMl = Number((prod as Loose).totalMl ?? 0);
    const availableMl = openMl + sealedStock * totalMl;
    if (cp.productVariation) {
      return availableMl >= sizeOf(cp.productVariation as Loose) * cp.quantity;
    }
    return sealedStock >= cp.quantity;
  });
}

const priceOf = (c: Combo): number => {
  const list = Number(c.finalPrice);
  const disc = Number(c.discount ?? 0);
  return disc > 0 && Number.isFinite(list) ? list - disc : list;
};

function build(c: Combo, ml: number): ComboSize {
  const products = c.comboProducts ?? [];
  const decants = products.reduce((n, cp) => n + (cp.quantity || 1), 0);
  const price = priceOf(c);
  const before = products.reduce((sum, cp) => {
    const unit = ml > 0 ? decantPrice(cp, ml) : Number((cp.productVariation as Loose | undefined)?.price ?? cp.product?.price ?? 0);
    return sum + unit * cp.quantity;
  }, 0);
  const savings = before > price ? before - price : 0;
  return {
    ml,
    combo: c,
    products,
    decants,
    totalMl: ml * decants,
    price,
    before,
    savings,
    pct: before > 0 ? Math.round((savings / before) * 100) : 0,
    inStock: inStockOf(products),
    hasBajoPedido: products.some((cp) => cp.product?.bajoPedido),
  };
}

export function comboSizes(combo: Combo): ComboSize[] {
  const byMl = new Map<number, ComboSize>();
  for (const c of [combo, ...(combo.versions ?? [])]) {
    const first = (c.comboProducts ?? []).find((cp) => cp.productVariation && !(cp.productVariation as Loose).isFullBottle);
    const ml = sizeOf(first?.productVariation as Loose | undefined);
    if (ml > 0 && !byMl.has(ml)) byMl.set(ml, build(c, ml));
  }
  if (byMl.size > 0) return [...byMl.values()].sort((a, b) => a.ml - b.ml);
  return [build(combo, 0)];
}

/** Decants (suma de cantidades) que trae el combo. */
export const comboDecantCount = (combo: Combo): number =>
  (combo.comboProducts ?? []).reduce((n, cp) => n + (cp.quantity || 1), 0);

/** ml elegido desde ?size= (solo si ese tamaño existe). */
export function sizeFromQuery(sizes: ComboSize[]): number | null {
  if (typeof window === 'undefined') return null;
  const q = Number(new URLSearchParams(window.location.search).get('size'));
  return sizes.some((s) => s.ml === q && q > 0) ? q : null;
}

/**
 * Línea de carrito del combo en un tamaño. variantId incluye el tamaño: el mismo
 * combo en 2 tamaños son 2 líneas. `comboId` es el de la versión (el backend la conoce).
 */
export function buildComboCartItem(base: Combo, size: ComboSize): CartItem {
  const products = size.products;
  const comboProducts = products.map((cp) => {
    const variant = cp.productVariation;
    if (variant) return { productVariationId: parseInt(String(variant.id), 10), quantity: cp.quantity };
    return { productId: parseInt(String(cp.productId), 10), quantity: cp.quantity };
  });
  const key = size.ml > 0 ? `combo-${base.id}-${size.ml}` : `combo-${base.id}`;
  return {
    productId: `combo-${base.id}`,
    variantId: key,
    name: base.name,
    image: size.combo.imageUrl || base.imageUrl || (products[0]?.product as Loose | undefined)?.image || '',
    ml: 0,
    size: size.ml > 0 ? size.ml : undefined,
    comboDecants: size.decants,
    price: size.price,
    quantity: 1,
    comboId: size.combo.id,
    comboProducts,
    bajoPedido: size.hasBajoPedido,
  };
}

/** Foto de un perfume del combo (acepta la forma cruda o la mapeada). */
export function comboProductImage(cp: ComboProduct): string {
  const p = cp.product as Loose | undefined;
  return p?.imageUrl || p?.image || p?.images?.[0]?.url || p?.images?.[0] || '';
}

/** Notas con color de un perfume (hasta `max`), aplanando sus etapas. */
export function comboProductNotes(cp: ComboProduct, max = 3): { name: string; color: string }[] {
  const sections = ((cp.product as Loose | undefined)?.scentSections ?? []) as { notes?: { name: string; color: string }[] }[];
  // Una por etapa (salida, corazón, fondo) para que se vea variedad.
  const picks = sections.map((s) => s.notes?.[0]).filter(Boolean) as { name: string; color: string }[];
  const rest = sections.flatMap((s) => s.notes ?? []).filter((n) => !picks.includes(n));
  return [...picks, ...rest].slice(0, max);
}
