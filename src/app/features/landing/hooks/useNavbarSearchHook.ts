import { useCallback, useEffect, useState } from 'react';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';
import type { Product } from '@/app/types/global.types';

const REC_KEY = 'nd_rec';
const MIN_CHARS = 2;
const DEBOUNCE_MS = 400; // el API limita a 20 req/min
const RESULT_LIMIT = 7;
const SHOWN = 6;

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

/** Lógica del buscador: debounce, caché (TanStack Query), recientes y populares. */
export function useNavbarSearchHook(open: boolean) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim().toLowerCase()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (open) setRecents(readRecents());
    else setQ('');
  }, [open]);

  const trimmed = q.trim().toLowerCase();
  const active = debounced.length >= MIN_CHARS;
  // Mientras el usuario escribe más rápido que el debounce, no mostramos "sin resultados".
  const typing = trimmed !== debounced;

  const search = useProductsQuery({
    queryParams: { search: debounced, limit: RESULT_LIMIT },
    enabled: open && active,
  });
  const popular = useProductsQuery({
    queryParams: { limit: 8, sortBy: 'salesCount', sortOrder: 'DESC' },
    enabled: open,
  });

  const results = active && trimmed.length >= MIN_CHARS ? (search.data?.content ?? []) : [];
  const total = search.data?.pagination?.total ?? results.length;

  const saveRecent = useCallback((term: string) => {
    const t = term.trim();
    if (t.length < MIN_CHARS) return;
    try {
      const next = [t, ...readRecents().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
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

  const popularProducts = popular.data?.content ?? [];
  const brands = Array.from(
    new Set(popularProducts.map((p) => p.marca?.name).filter((n): n is string => !!n)),
  ).slice(0, 6);
  const matchingBrands = active
    ? Array.from(
        new Set(
          results
            .map((p) => p.marca?.name)
            .filter((n): n is string => !!n && n.toLowerCase().includes(debounced)),
        ),
      ).slice(0, 3)
    : [];

  return {
    q,
    setQ,
    term: debounced,
    active,
    typing,
    isLoading: search.isFetching,
    results: results.slice(0, SHOWN),
    total,
    hasMore: total > SHOWN,
    popularProducts: popularProducts.slice(0, 4),
    brands,
    matchingBrands,
    recents,
    saveRecent,
    clearRecents,
  };
}
