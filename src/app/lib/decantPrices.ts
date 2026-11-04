import { fetchAllProducts } from '@/app/tanstack-queries/productsQuery';
import type { Product } from '@/app/types/global.types';

/** Un formato (decant o frasco) de un producto, venga de `formats` (listado) o `variants` (detalle). */
interface Fmt {
  ml: number;
  price: number;
  isFullBottle: boolean;
}

function formatsOf(p: Product): Fmt[] {
  const src = p.formats?.length ? p.formats : p.variants ?? [];
  return src
    .map((f) => ({ ml: Number(f.ml), price: Number(f.price), isFullBottle: !!f.isFullBottle }))
    .filter((f) => f.price > 0);
}

const activeProducts = (list: Product[]) => list.filter((p) => p.isActive !== false);

/** Precio mínimo de un decant de `ml` entre los productos, o null si no hay. */
export function minDecantPrice(list: Product[], ml: number): number | null {
  const prices = activeProducts(list).flatMap((p) =>
    formatsOf(p).filter((f) => !f.isFullBottle && f.ml === ml).map((f) => f.price),
  );
  return prices.length ? Math.min(...prices) : null;
}

/** Precio mínimo de un frasco completo, o null si no hay. */
export function minBottlePrice(list: Product[]): number | null {
  const prices = activeProducts(list).flatMap((p) =>
    formatsOf(p).filter((f) => f.isFullBottle).map((f) => f.price),
  );
  return prices.length ? Math.min(...prices) : null;
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export interface ProductPrices {
  ml3: number | null;
  ml10: number | null;
  bottle: number | null;
  bottleMl: number | null;
}

/** Precios de un producto real por nombre (con o sin marca); null si no existe. */
export function pricesByName(list: Product[], name: string): ProductPrices | null {
  const target = norm(name);
  const act = activeProducts(list);
  const p =
    act.find((x) => norm(x.name) === target || norm(`${x.marca?.name ?? ''} ${x.name}`) === target) ??
    act.find((x) => target.includes(norm(x.name)) && norm(x.name).length > 3);
  if (!p) return null;
  const fm = formatsOf(p);
  const at = (ml: number) => fm.find((f) => !f.isFullBottle && f.ml === ml)?.price ?? null;
  const bottle = fm.find((f) => f.isFullBottle);
  return { ml3: at(3), ml10: at(10), bottle: bottle?.price ?? null, bottleMl: bottle?.ml || null };
}

/** "$4,15" */
export function formatPriceEs(n: number): string {
  return `$${n.toFixed(2).replace('.', ',')}`;
}

let cache: { at: number; list: Product[] } | null = null;

/** Catálogo completo para páginas `.astro` (caché de un minuto). Lista vacía si la API falla. */
export async function getCatalogServer(): Promise<Product[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.list;
  try {
    const res = await fetchAllProducts();
    cache = { at: Date.now(), list: res.content ?? [] };
    return cache.list;
  } catch {
    return [];
  }
}
