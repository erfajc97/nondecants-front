import { useState, useEffect, useCallback } from 'react';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';
import { useRawCategoriesQuery } from '@/app/tanstack-queries/categoriesQuery';
import type { CatalogFilters } from '../types';
import type { Gender, TimeOfDay, Concentration, Projection } from '@/app/types/global.types';

export interface UseCatalogHookProps {
  tipo?: 'perfumes' | 'combos';
  bajoPedido?: boolean;
  initialCategoryId?: number;
  initialMarcaId?: number;
}

// Productos por página: 12 en desktop (3 filas del grid de 4) y 10 en móvil
// (5 filas de 2). En ambos casos la última fila queda completa.
const DESKTOP_LIMIT = 12;
const MOBILE_LIMIT = 10;
/** Vista marca: máximo 3 filas (4×3 desktop, 2×3 móvil) + «Ver más». */
const BRAND_DESKTOP_LIMIT = 12;
const BRAND_MOBILE_LIMIT = 6;
const DESKTOP_QUERY = '(min-width: 768px)';

const defaultFilters: CatalogFilters = {
  search: '',
  inStock: false,
  gender: '',
  timeOfDay: '',
  concentration: '',
  projection: '',
  page: 1,
  sortBy: 'createdAt',
  order: 'desc',
};

/**
 * REQ-058 — URLs legibles con slugs: `?categoria=arabes&marca=giorgio-armani`.
 * Se ACEPTAN los formatos viejo (`category=3&marca=3`, IDs numéricos) y nuevo
 * (`categoria=<slug>&marca=<slug>`); la API sigue recibiendo IDs — el slug se
 * resuelve a id en front con las categorías/marcas ya cargadas, y la URL se
 * reescribe con slugs vía history.replaceState.
 */
const normalizeSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const matchesSlug = (item: { name: string; slug: string }, value: string) => {
  const v = normalizeSlug(value);
  return normalizeSlug(item.slug) === v || normalizeSlug(item.name) === v.replace(/-/g, ' ');
};

function getUrlParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get('category');
  const marcaParam = params.get('marca');
  return {
    // Formato viejo: IDs numéricos (los menús aún pueden generarlos).
    categoryId: categoryParam && /^\d+$/.test(categoryParam) ? Number(categoryParam) : undefined,
    marcaId: marcaParam && /^\d+$/.test(marcaParam) ? Number(marcaParam) : undefined,
    // Formato nuevo: slugs. `marca` también acepta slug (además de id legado).
    categorySlug: params.get('categoria') ?? undefined,
    marcaSlug: marcaParam && !/^\d+$/.test(marcaParam) ? marcaParam : undefined,
    search: params.get('search') ?? undefined,
    // Atajos del home ("Empieza por el momento"): ?momento=DIA|NOCHE
    timeOfDay: ['DIA', 'NOCHE'].includes(params.get('momento') ?? '')
      ? (params.get('momento') as 'DIA' | 'NOCHE')
      : undefined,
  };
}

export function useCatalogHook({ tipo, bajoPedido, initialCategoryId, initialMarcaId }: UseCatalogHookProps = {}) {
  const urlParams = getUrlParams();
  const catId = initialCategoryId ?? urlParams.categoryId;
  const subId = initialMarcaId ?? urlParams.marcaId;

  const [filters, setFilters] = useState<CatalogFilters>({
    ...defaultFilters,
    search: urlParams.search ?? '',
    timeOfDay: urlParams.timeOfDay ?? defaultFilters.timeOfDay,
    categoryId: catId,
    marcaId: subId,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(filters.maxPrice);

  // Slugs pendientes de resolver (llegan por URL; se resuelven a IDs cuando
  // cargan las categorías). Con IDs numéricos no hay nada pendiente.
  const [pendingSlugs] = useState(() => ({
    categoria: initialCategoryId == null ? urlParams.categorySlug : undefined,
    marca: initialMarcaId == null && urlParams.marcaId == null ? urlParams.marcaSlug : undefined,
  }));
  const [slugsResolved, setSlugsResolved] = useState(!pendingSlugs.categoria && !pendingSlugs.marca);

  const { data: rawCategories = [] } = useRawCategoriesQuery();

  // Resolver slugs de la URL → IDs (una sola vez, al cargar las categorías).
  useEffect(() => {
    if (slugsResolved || rawCategories.length === 0) return;
    let categoryId: number | undefined;
    let marcaId: number | undefined;
    if (pendingSlugs.categoria) {
      const cat = rawCategories.find((c) => matchesSlug(c, pendingSlugs.categoria!));
      if (cat) categoryId = Number(cat.id);
    }
    if (pendingSlugs.marca) {
      const pool = categoryId != null
        ? rawCategories.filter((c) => Number(c.id) === categoryId)
        : rawCategories;
      for (const c of pool) {
        const m = c.marcas.find((marca) => matchesSlug(marca, pendingSlugs.marca!));
        if (m) {
          marcaId = Number(m.id);
          // Marca sola (sin categoría en la URL): se filtra solo por marca,
          // igual que el formato viejo `?marca=3`.
          if (pendingSlugs.categoria && categoryId == null) categoryId = Number(c.id);
          break;
        }
      }
    }
    setFilters((f) => ({
      ...f,
      categoryId: categoryId ?? f.categoryId,
      marcaId: marcaId ?? f.marcaId,
      page: 1,
    }));
    setSlugsResolved(true);
  }, [slugsResolved, rawCategories, pendingSlugs]);

  // Reescribir la URL con slugs legibles al cambiar categoría/marca (o cuando
  // llega en formato viejo con IDs). Conserva los demás params (search, etc.).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!slugsResolved || rawCategories.length === 0) return;
    const cat = filters.categoryId != null
      ? rawCategories.find((c) => Number(c.id) === filters.categoryId)
      : undefined;
    const marca = filters.marcaId != null
      ? rawCategories.flatMap((c) => c.marcas).find((m) => Number(m.id) === filters.marcaId)
      : undefined;
    const params = new URLSearchParams(window.location.search);
    params.delete('category');
    if (cat) params.set('categoria', cat.slug);
    else params.delete('categoria');
    if (marca) params.set('marca', marca.slug);
    else params.delete('marca');
    // El filtro "con descuento" se retiró del panel: se limpia el parámetro
    // viejo para que un enlace guardado no deje el catálogo filtrado sin forma
    // de quitarlo.
    params.delete('descuento');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [filters.categoryId, filters.marcaId, rawCategories, slugsResolved]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMaxPrice(filters.maxPrice), 300);
    return () => clearTimeout(timer);
  }, [filters.maxPrice]);

  // El tamaño de página sigue al ancho de pantalla; si el usuario gira el
  // teléfono o cambia el tamaño de la ventana, se vuelve a la primera página
  // para no quedar en una página que ya no existe.
  const [limit, setLimit] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
      ? DESKTOP_LIMIT
      : MOBILE_LIMIT,
  );
  const [brandChunks, setBrandChunks] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => {
      const next = mq.matches ? DESKTOP_LIMIT : MOBILE_LIMIT;
      setLimit((prev) => {
        if (prev !== next) setFilters((f) => ({ ...f, page: 1 }));
        return next;
      });
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // El flag de la página (bajoPedido={true} en /bajo-pedido, ={false} en
  // /catalogo/perfumes) SIEMPRE se respeta, incluso al navegar a una casa
  // (marca) o categoría. Así la sección "Bajo Pedido" muestra solo bajo
  // pedido y "Perfumes" solo stock, en cualquier nivel de navegación.
  const isBrandView = filters.marcaId != null && slugsResolved;
  const brandPageSize = limit === DESKTOP_LIMIT ? BRAND_DESKTOP_LIMIT : BRAND_MOBILE_LIMIT;

  useEffect(() => {
    setBrandChunks(1);
  }, [
    filters.marcaId,
    filters.categoryId,
    filters.gender,
    filters.timeOfDay,
    filters.concentration,
    filters.projection,
    debouncedSearch,
    debouncedMaxPrice,
  ]);

  const queryParams = {
    page: isBrandView ? 1 : filters.page,
    limit: isBrandView ? brandPageSize * brandChunks : limit,
    search: debouncedSearch || undefined,
    inStock: filters.inStock || undefined,
    bajoPedido,
    categoryId: filters.categoryId,
    marcaId: filters.marcaId,
    gender: filters.gender || undefined,
    timeOfDay: filters.timeOfDay || undefined,
    concentration: filters.concentration || undefined,
    projection: filters.projection || undefined,
    minPrice: filters.minPrice,
    maxPrice: debouncedMaxPrice,
    sortBy: filters.sortBy,
    sortOrder: filters.order?.toUpperCase() as 'ASC' | 'DESC',
  };

  const { data, isLoading, isFetching } = useProductsQuery({ queryParams });

  const products = data?.content ?? [];
  const pagination = data?.pagination;
  const hasMore = isBrandView && (pagination?.total ?? 0) > products.length;
  const loadMore = useCallback(() => {
    setBrandChunks((chunks) => chunks + 1);
  }, []);

  const showBrandBackorder = bajoPedido === false && filters.marcaId != null && slugsResolved;
  const brandBackorderQuery = useProductsQuery({
    queryParams: {
      page: 1,
      limit: DESKTOP_LIMIT,
      marcaId: filters.marcaId,
      bajoPedido: true,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
    enabled: showBrandBackorder,
  });

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }, []);

  const setInStock = useCallback((inStock: boolean) => {
    setFilters((f) => ({ ...f, inStock, page: 1 }));
  }, []);

  const setGender = useCallback((gender: Gender | '') => {
    setFilters((f) => ({ ...f, gender, page: 1 }));
  }, []);

  const setTimeOfDay = useCallback((timeOfDay: TimeOfDay | '') => {
    setFilters((f) => ({ ...f, timeOfDay, page: 1 }));
  }, []);

  const setConcentration = useCallback((concentration: Concentration | '') => {
    setFilters((f) => ({ ...f, concentration, page: 1 }));
  }, []);

  const setProjection = useCallback((projection: Projection | '') => {
    setFilters((f) => ({ ...f, projection, page: 1 }));
  }, []);

  const setPriceRange = useCallback((minPrice?: number, maxPrice?: number) => {
    setFilters((f) => ({ ...f, minPrice, maxPrice, page: 1 }));
  }, []);

  const setCategoryId = useCallback((categoryId?: number) => {
    setFilters((f) => ({ ...f, categoryId, marcaId: undefined, page: 1 }));
  }, []);

  const setMarcaId = useCallback((marcaId?: number) => {
    setFilters((f) => ({ ...f, marcaId, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const setSort = useCallback((sortValue: string) => {
    const [sortBy, order] = sortValue.split(':') as [
      CatalogFilters['sortBy'],
      CatalogFilters['order'],
    ];
    setFilters((f) => ({
      ...f,
      sortBy: sortBy || 'createdAt',
      order: order || 'desc',
      page: 1,
    }));
  }, []);

  const sortValue = `${filters.sortBy}:${filters.order}`;

  const clearFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      categoryId: initialCategoryId,
      marcaId: initialMarcaId,
    });
  }, [initialCategoryId, initialMarcaId]);

  const hasActiveFilters = !!(
    filters.search || filters.gender ||
    filters.timeOfDay || filters.concentration || filters.projection ||
    filters.minPrice || filters.maxPrice ||
    (filters.categoryId && filters.categoryId !== catId)
  );

  return {
    filters,
    products,
    pagination,
    isLoading,
    isFetching,
    sortValue,
    hasActiveFilters,
    isBrandView,
    hasMore,
    loadMore,
    showBrandBackorder,
    brandBackorderProducts: brandBackorderQuery.data?.content ?? [],
    brandBackorderTotal: brandBackorderQuery.data?.pagination?.total ?? 0,
    brandBackorderLoading: brandBackorderQuery.isLoading,
    brandBackorderFetching: brandBackorderQuery.isFetching,
    selectedMarca: filters.marcaId != null
      ? rawCategories.flatMap((c) => c.marcas).find((m) => Number(m.id) === filters.marcaId)
      : undefined,
    setSearch,
    setInStock,
    setGender,
    setTimeOfDay,
    setConcentration,
    setProjection,
    setPriceRange,
    setCategoryId,
    setMarcaId,
    setSort,
    setPage,
    clearFilters,
  };
}
