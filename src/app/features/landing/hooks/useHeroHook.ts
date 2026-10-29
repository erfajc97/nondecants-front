import { useLandingSectionsActiveQuery } from '@/app/tanstack-queries/landingSectionsQuery';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';
import type { Product } from '@/app/types/global.types';

export interface HeroCollage {
  /** Packshots: [izquierda, centro, derecha]. */
  products: [Product, Product, Product];
  bottlePrice: number;
  decantPrice: number;
  brands: string[];
}

const productImage = (p: Product): string | undefined => {
  const first = p.images?.[0] as unknown;
  const fromGallery = typeof first === 'string' ? first : (first as { url?: string } | undefined)?.url;
  return fromGallery || p.image || p.imageUrl || undefined;
};

export const heroProductImage = productImage;

/** "$270" si es entero, "$11,75" si no — como en el titular del prototipo. */
export const shortMoney = (n: number): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

/**
 * Slide principal del hero con packshots reales: el perfume más caro del
 * catálogo destacado va al centro y da el titular ("El frasco de $270, en 3 ml
 * por $11,75."). Sin datos suficientes devuelve null y el hero usa los banners.
 */
function buildCollage(products: Product[]): HeroCollage | null {
  const seen = new Set<string>();
  const pool = products.filter((p) => {
    if (seen.has(p.id) || !productImage(p)) return false;
    seen.add(p.id);
    return true;
  });
  if (pool.length < 3) return null;

  const priced = pool
    .map((p) => {
      const formats = p.formats ?? [];
      const bottle = formats.find((f) => f.isFullBottle)?.price ?? Number(p.price ?? 0);
      const decant = formats.filter((f) => !f.isFullBottle && f.ml > 0).sort((a, b) => a.ml - b.ml)[0]?.price ?? 0;
      return { p, bottle, decant };
    })
    .filter((x) => x.bottle > 0 && x.decant > 0);
  if (priced.length === 0) return null;

  const center = priced.reduce((a, b) => (b.bottle > a.bottle ? b : a));
  const others = pool.filter((p) => p.id !== center.p.id).slice(0, 2);
  const brands = [center.p, ...others]
    .map((p) => p.marca?.name)
    .filter((n, i, arr): n is string => !!n && arr.indexOf(n) === i);

  return {
    products: [others[0], center.p, others[1]],
    bottlePrice: center.bottle,
    decantPrice: center.decant,
    brands,
  };
}

export function useHeroHook() {
  const { data: sections, isLoading: sectionsLoading } = useLandingSectionsActiveQuery();
  const { data: catalog } = useProductsQuery({ queryParams: { limit: 1, isActive: true } });

  const collage = buildCollage((sections ?? []).flatMap((s) => s.products));
  return {
    collage,
    sectionsLoading,
    catalogCount: catalog?.pagination?.total ?? null,
  };
}
