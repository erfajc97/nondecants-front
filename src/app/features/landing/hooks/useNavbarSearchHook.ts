import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/app/tanstack-queries/productsQuery';
import { useRawCategoriesQuery } from '@/app/tanstack-queries/categoriesQuery';
import { searchProducts, topNotes, brandOf, norm, type Hit } from '@/app/lib/searchIndex';
import type { Product } from '@/app/types/global.types';

const REC_KEY = 'nd_rec';
const MIN_CHARS = 1;
const SHOWN = 6;
const PAGE = 100;

export const minPriceOf = (p: Product) => {
  if (p.minFormatPrice && p.minFormatPrice > 0) return p.minFormatPrice;
  const prices = (p.variants ?? []).map((v) => v.price).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : (p.price ?? 0);
};

const readRecents = (): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(REC_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
};

/** Lista completa (ordenada por ventas), una sola vez y en caché: el buscador filtra en el navegador. */
async function fetchSearchList(): Promise<Product[]> {
  const first = await fetchProducts({ page: 1, limit: PAGE, sortBy: 'salesCount', sortOrder: 'DESC' } as any);
  const out = [...first.content];
  const pages = Math.min(first.pagination?.totalPages ?? 1, 6);
  for (let page = 2; page <= pages; page++) {
    const next = await fetchProducts({ page, limit: PAGE, sortBy: 'salesCount', sortOrder: 'DESC' } as any);
    out.push(...next.content);
  }
  return out.filter((p) => p.isActive !== false);
}

/** Lógica del buscador: índice local, recientes, populares, notas y sugerencias. */
export function useNavbarSearchHook(open: boolean) {
  const [q, setQ] = useState('');
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecents(readRecents());
    else setQ('');
  }, [open]);

  const list = useQuery({
    queryKey: ['search-index'],
    queryFn: fetchSearchList,
    enabled: open,
    staleTime: 10 * 60_000,
  });
  const cats = useRawCategoriesQuery();

  const products = list.data ?? [];
  const categoryNames = useMemo(() => {
    const m: Record<string, string> = {};
    (cats.data ?? []).forEach((c) => (m[String(c.id)] = c.name));
    return m;
  }, [cats.data]);

  const term = q.trim();
  const active = norm(term).length >= MIN_CHARS;
  const out = useMemo(
    () => (active ? searchProducts(products, term, { categoryNames }) : { hits: [], houses: [], notes: [], suggestion: undefined }),
    [active, products, term, categoryNames],
  );

  const saveRecent = useCallback((t: string) => {
    const s = t.trim();
    if (s.length < 2) return;
    try {
      const next = [s, ...readRecents().filter((x) => x.toLowerCase() !== s.toLowerCase())].slice(0, 5);
      localStorage.setItem(REC_KEY, JSON.stringify(next));
      setRecents(next);
    } catch {
      /* storage bloqueado */
    }
  }, []);

  const clearRecents = useCallback(() => {
    try {
      localStorage.removeItem(REC_KEY);
    } catch {
      /* noop */
    }
    setRecents([]);
  }, []);

  const popularProducts = products.slice(0, 4);
  const mostSearched = useMemo(() => {
    const names = new Set<string>();
    for (const p of products) {
      const b = brandOf(p);
      if (b) names.add(b);
      if (names.size >= 3) break;
    }
    for (const p of products) {
      names.add(p.name);
      if (names.size >= 6) break;
    }
    return [...names];
  }, [products]);
  const noteChips = useMemo(() => topNotes(products, 8), [products]);

  const hits: Hit<Product>[] = out.hits;
  return {
    q,
    setQ,
    term,
    active,
    isLoading: list.isLoading,
    hits: hits.slice(0, SHOWN),
    total: hits.length,
    hasMore: hits.length > SHOWN,
    houses: out.houses,
    notes: out.notes,
    suggestion: out.suggestion,
    popularProducts,
    mostSearched,
    noteChips,
    recents,
    saveRecent,
    clearRecents,
  };
}
