import type { Product } from '@/app/types/global.types';
import { searchProducts } from '@/app/lib/searchIndex';
import { MOMENTO_OPTIONS, PRICE3_OPTIONS } from './data';
import type { CatalogCriteria, CategoryKey, FilterContext, FilterSection, SortKey } from './types';

export const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const keyFromName = (name: string): CategoryKey | undefined => {
  const n = norm(name).replace(/\s+/g, '-');
  if (/bajo-?pedido/.test(n)) return 'bajo-pedido';
  if (/disenador|designer/.test(n)) return 'disenador';
  if (/nicho|niche/.test(n)) return 'nicho';
  if (/arab/.test(n)) return 'arabes';
  if (n === 'todos') return 'todos';
  return undefined;
};

interface Meta {
  momentos: string[];
  notas: Set<string>;
  price3: number | null;
  text: string;
}

const metaCache = new WeakMap<Product, Meta>();

function metaOf(p: Product): Meta {
  const hit = metaCache.get(p);
  if (hit) return hit;

  const occ = new Set((p.occasion ?? []).map(norm));
  let momentos = MOMENTO_OPTIONS.filter((o) => occ.has(norm(o.label))).map((o) => o.value);
  if (momentos.length === 0) {
    if (p.timeOfDay === 'NOCHE') momentos = ['noche'];
    else if (p.timeOfDay === 'DIA') momentos = ['oficina'];
    else if (p.timeOfDay === 'AMBOS') momentos = ['oficina', 'noche'];
  }

  const notas = new Set<string>();
  for (const s of p.scentSections ?? []) for (const n of s.notes ?? []) notas.add(norm(n.name));

  const formats = p.formats?.length
    ? p.formats
    : (p.variants ?? []).map((v) => ({ ml: v.mlSize ?? v.ml, price: v.price, isFullBottle: v.isFullBottle }));
  const three = formats.find((f) => !f.isFullBottle && Number(f.ml) === 3);

  const meta: Meta = {
    momentos,
    notas,
    // Precio final (con descuento), igual que muestra la tarjeta.
    price3:
      three && Number.isFinite(Number(three.price))
        ? Number(three.price) * (Number(p.discount) > 0 ? 1 - Number(p.discount) / 100 : 1)
        : null,
    text: norm(`${p.name} ${p.marca?.name ?? ''}`),
  };
  metaCache.set(p, meta);
  return meta;
}

/** Precio de entrada (formato más barato), para ordenar. */
export function entryPrice(p: Product): number {
  if (p.minFormatPrice != null && Number.isFinite(p.minFormatPrice)) return p.minFormatPrice;
  const prices = [...(p.formats ?? []), ...(p.variants ?? [])].map((f) => Number(f.price)).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : Number(p.price ?? 0);
}

/** Precio del decant de 3 ml (para «Pruébalo desde $X»). */
export const price3Of = (p: Product) => metaOf(p).price3;

export function matches(p: Product, c: CatalogCriteria, ctx: FilterContext): boolean {
  if (c.marcaId != null && p.marcaId !== c.marcaId) return false;
  if (c.category === 'bajo-pedido') {
    if (!p.bajoPedido) return false;
  } else if (c.category !== 'todos') {
    if (p.categoryId == null || ctx.catKeyById.get(p.categoryId) !== c.category) return false;
  }
  if (c.genders.length && !(p.gender && c.genders.includes(p.gender))) return false;
  const m = metaOf(p);
  if (c.momentos.length && !c.momentos.some((v) => m.momentos.includes(v))) return false;
  if (c.precios.length) {
    if (m.price3 == null) return false;
    const n = m.price3;
    if (!PRICE3_OPTIONS.some((o) => c.precios.includes(o.value) && o.test(n))) return false;
  }
  if (c.notas.length && !c.notas.some((v) => m.notas.has(v))) return false;
  if (c.casas.length && !c.casas.includes(String(p.marcaId))) return false;
  if (c.search && !m.text.includes(norm(c.search)) && searchProducts([p], c.search).hits.length === 0) return false;
  return true;
}

export const filterProducts = (all: Product[], c: CatalogCriteria, ctx: FilterContext) =>
  all.filter((p) => matches(p, c, ctx));

export function sortProducts(rows: Product[], sort: SortKey): Product[] {
  const out = [...rows];
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  if (sort === 'menor') out.sort((a, b) => entryPrice(a) - entryPrice(b) || byName(a, b));
  else if (sort === 'mayor') out.sort((a, b) => entryPrice(b) - entryPrice(a) || byName(a, b));
  else if (sort === 'novedades')
    out.sort((a, b) => (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0) || byName(a, b));
  else out.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0) || byName(a, b));
  return out;
}

/** Cuántos perfumes quedarían si esta sección tuviera solo `value` elegido. */
export function countWith(
  all: Product[],
  c: CatalogCriteria,
  ctx: FilterContext,
  section: FilterSection | 'category',
  value: string,
): number {
  const next: CatalogCriteria =
    section === 'category' ? { ...c, category: value as CategoryKey } : { ...c, [section]: [value] };
  let n = 0;
  for (const p of all) if (matches(p, next, ctx)) n++;
  return n;
}
