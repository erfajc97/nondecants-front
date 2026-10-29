import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';
import { useRawCategoriesQuery } from '@/app/tanstack-queries/categoriesQuery';
import { GENDER_OPTIONS, LEGACY_MOMENTO, MOMENTO_OPTIONS, NOTE_OPTIONS, PRICE3_OPTIONS } from '../data';
import { countWith, filterProducts, keyFromName, norm, price3Of, sortProducts } from '../filtering';
import type {
  ActiveChip,
  CatalogCriteria,
  CategoryKey,
  FilterContext,
  FilterOption,
  FilterSection,
  SortKey,
} from '../types';

export interface UseCatalogHookProps {
  /** Categoría por defecto de la página (p. ej. /bajo-pedido). La URL manda sobre ella. */
  initialCategory?: CategoryKey;
  /** `Astro.url.search` — así servidor y cliente arrancan con el mismo estado. */
  initialQuery?: string;
}

const PAGE_SIZE = 24;

const slugify = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

interface Selections {
  genders: string[];
  momentos: string[];
  precios: string[];
  notas: string[];
  casas: string[];
  search: string;
}

const EMPTY: Selections = { genders: [], momentos: [], precios: [], notas: [], casas: [], search: '' };

function parseQuery(qs: string) {
  const p = new URLSearchParams(qs);
  return {
    categoria: p.get('categoria'),
    legacyCategoryId: /^\d+$/.test(p.get('category') ?? '') ? Number(p.get('category')) : undefined,
    marca: p.get('marca'),
    search: p.get('search') ?? '',
    momento: p.get('momento') ?? '',
  };
}

export function useCatalogHook({ initialCategory, initialQuery }: UseCatalogHookProps = {}) {
  const [q] = useState(() =>
    parseQuery(initialQuery ?? (typeof window !== 'undefined' ? window.location.search : '')),
  );

  const [category, setCategoryState] = useState<CategoryKey>(
    (q.categoria ? keyFromName(q.categoria) : undefined) ?? initialCategory ?? 'todos',
  );
  const [pendingCategoryId, setPendingCategoryId] = useState(q.legacyCategoryId);
  const [selections, setSelections] = useState<Selections>(() => ({
    ...EMPTY,
    search: q.search,
    momentos: LEGACY_MOMENTO[q.momento] ? [LEGACY_MOMENTO[q.momento]] : [],
  }));
  const [marcaParam, setMarcaParam] = useState<string | undefined>(q.marca ?? undefined);
  const [sort, setSortState] = useState<SortKey>('pedidos');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data: rawCategories = [] } = useRawCategoriesQuery();
  const productsQuery = useProductsQuery({ queryParams: { page: 1, limit: 200 } });
  const all = useMemo(() => productsQuery.data?.content ?? [], [productsQuery.data]);

  // Categoría (id) → clave del catálogo, por nombre normalizado (no depende de IDs por entorno).
  const ctx = useMemo<FilterContext>(() => {
    const catKeyById = new Map<number, CategoryKey>();
    for (const c of rawCategories) {
      const key = keyFromName(c.name);
      if (key) catKeyById.set(Number(c.id), key);
    }
    return { catKeyById };
  }, [rawCategories]);

  // Enlaces viejos `?category=<id>` → clave.
  useEffect(() => {
    if (pendingCategoryId == null || rawCategories.length === 0) return;
    const key = ctx.catKeyById.get(pendingCategoryId);
    if (key) setCategoryState(key);
    setPendingCategoryId(undefined);
  }, [pendingCategoryId, rawCategories, ctx]);

  // Marca de la URL (id o slug) → casa real.
  const marcaPending = marcaParam != null && rawCategories.length === 0;
  const marca = useMemo(() => {
    if (marcaParam == null) return undefined;
    for (const c of rawCategories) {
      for (const m of c.marcas) {
        const v = norm(marcaParam);
        if (
          String(m.id) === marcaParam ||
          norm(m.slug ?? '') === v ||
          slugify(m.name) === slugify(marcaParam)
        ) {
          return {
            id: Number(m.id),
            name: m.name as string,
            slug: (m.slug as string | null) || slugify(m.name),
            categoryId: Number(c.id),
            categoryName: c.name as string,
            categoryKey: keyFromName(c.name),
          };
        }
      }
    }
    return undefined;
  }, [marcaParam, rawCategories]);

  const isBrandView = !!marca;

  const criteria = useMemo<CatalogCriteria>(
    () => ({ category: marca ? 'todos' : category, ...selections, marcaId: marca?.id }),
    [category, selections, marca],
  );

  // URL legible: ?categoria=arabes&marca=creed (conserva el resto de parámetros).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.delete('category');
    params.delete('momento');
    if (category !== 'todos') params.set('categoria', category);
    else params.delete('categoria');
    if (marca) params.set('marca', marca.slug);
    else if (!marcaPending) params.delete('marca');
    if (selections.search) params.set('search', selections.search);
    else params.delete('search');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [category, marca, marcaPending, selections.search]);

  const results = useMemo(() => sortProducts(filterProducts(all, criteria, ctx), sort), [all, criteria, ctx, sort]);
  const shown = useMemo(() => results.slice(0, visible), [results, visible]);

  // Conteos por opción: «cuántos quedarían si se elige».
  const casaOptions = useMemo<FilterOption[]>(() => {
    const seen = new Map<number, string>();
    for (const p of all) if (p.marcaId != null && p.marca?.name) seen.set(p.marcaId, p.marca.name);
    return [...seen.entries()]
      .map(([id, label]) => ({ value: String(id), label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    const add = (section: FilterSection, opts: FilterOption[]) => {
      for (const o of opts) out[`${section}:${o.value}`] = countWith(all, criteria, ctx, section, o.value);
    };
    add('genders', GENDER_OPTIONS);
    add('momentos', MOMENTO_OPTIONS);
    add('precios', PRICE3_OPTIONS);
    add('notas', NOTE_OPTIONS);
    add('casas', casaOptions);
    return out;
  }, [all, criteria, ctx, casaOptions]);

  const categoryCounts = useMemo(() => {
    const keys: CategoryKey[] = ['todos', 'disenador', 'nicho', 'arabes', 'bajo-pedido'];
    const base = { ...criteria, marcaId: undefined };
    return Object.fromEntries(keys.map((k) => [k, countWith(all, base, ctx, 'category', k)])) as Record<CategoryKey, number>;
  }, [all, criteria, ctx]);

  const setCategory = useCallback((key: CategoryKey) => {
    setCategoryState(key);
    setMarcaParam(undefined);
    setVisible(PAGE_SIZE);
  }, []);

  const toggle = useCallback((section: FilterSection, value: string) => {
    setSelections((s) => {
      const cur = s[section];
      return { ...s, [section]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
    setVisible(PAGE_SIZE);
  }, []);

  const clearFilters = useCallback(() => {
    setSelections(EMPTY);
    setVisible(PAGE_SIZE);
  }, []);

  const setSort = useCallback((s: SortKey) => setSortState(s), []);
  const loadMore = useCallback(() => setVisible((v) => v + PAGE_SIZE), []);
  const selectMarca = useCallback((slug?: string) => {
    setMarcaParam(slug);
    setVisible(PAGE_SIZE);
  }, []);

  const labelOf = (opts: FilterOption[], v: string) => opts.find((o) => o.value === v)?.label ?? v;
  const chips: ActiveChip[] = [
    ...selections.genders.map((v) => ({ key: `genders:${v}`, label: labelOf(GENDER_OPTIONS, v), onRemove: () => toggle('genders', v) })),
    ...selections.momentos.map((v) => ({ key: `momentos:${v}`, label: labelOf(MOMENTO_OPTIONS, v), onRemove: () => toggle('momentos', v) })),
    ...selections.precios.map((v) => ({ key: `precios:${v}`, label: `3 ml · ${labelOf(PRICE3_OPTIONS, v)}`, onRemove: () => toggle('precios', v) })),
    ...selections.notas.map((v) => ({ key: `notas:${v}`, label: labelOf(NOTE_OPTIONS, v), onRemove: () => toggle('notas', v) })),
    ...selections.casas.map((v) => ({ key: `casas:${v}`, label: labelOf(casaOptions, v), onRemove: () => toggle('casas', v) })),
  ];
  if (selections.search)
    chips.push({
      key: 'search',
      label: `“${selections.search}”`,
      onRemove: () => setSelections((s) => ({ ...s, search: '' })),
    });

  // Datos de la vista de marca (K12).
  const brandProducts = useMemo(() => (marca ? all.filter((p) => p.marcaId === marca.id) : []), [all, marca]);
  const brandFrom3ml = useMemo(() => {
    const prices = brandProducts.map(price3Of).filter((n): n is number => n != null);
    return prices.length ? Math.min(...prices) : null;
  }, [brandProducts]);
  const otherHouses = useMemo(() => {
    if (!marca) return [];
    const cat = rawCategories.find((c) => Number(c.id) === marca.categoryId);
    return (cat?.marcas ?? [])
      .filter((m) => Number(m.id) !== marca.id && m.isActive !== false)
      .map((m) => ({ id: Number(m.id), name: m.name as string, slug: (m.slug as string | null) || slugify(m.name) }));
  }, [marca, rawCategories]);

  return {
    category: marca ? 'todos' : category,
    criteria,
    chips,
    activeCount: chips.length,
    total: results.length,
    shown,
    hasMore: results.length > shown.length,
    loadMore,
    isLoading: productsQuery.isLoading || marcaPending,
    sort,
    setSort,
    setCategory,
    toggle,
    clearFilters,
    counts,
    categoryCounts,
    casaOptions,
    hasData: all.length > 0,
    isBrandView,
    marca,
    brandFrom3ml,
    otherHouses,
    selectMarca,
  };
}
