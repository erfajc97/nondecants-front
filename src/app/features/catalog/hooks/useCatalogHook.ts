import { useState, useEffect, useCallback } from 'react';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';
import type { CatalogFilters } from '../types';
import type { ProductType } from '@/app/types/global.types';

const LIMIT = 12;

const defaultFilters: CatalogFilters = {
  search:  '',
  type:    '',
  brand:   '',
  inStock: false,
  page:    1,
  sortBy:  'createdAt',
  order:   'desc',
};

export function useCatalogHook(initialParams?: Partial<CatalogFilters>) {
  const [filters, setFilters] = useState<CatalogFilters>({ ...defaultFilters, ...initialParams });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce 300ms en búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryParams = {
    page:    filters.page,
    limit:   LIMIT,
    search:  debouncedSearch || undefined,
    type:    filters.type || undefined,
    brand:   filters.brand || undefined,
    inStock: filters.inStock || undefined,
    sortBy:  filters.sortBy,
    order:   filters.order,
  };

  const { data, isLoading, isFetching } = useProductsQuery({ queryParams });

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }, []);

  const setType = useCallback((type: ProductType | '') => {
    setFilters((f) => ({ ...f, type, page: 1 }));
  }, []);

  const setBrand = useCallback((brand: string) => {
    setFilters((f) => ({ ...f, brand, page: 1 }));
  }, []);

  const setInStock = useCallback((inStock: boolean) => {
    setFilters((f) => ({ ...f, inStock, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  return {
    filters,
    products:   data?.content ?? [],
    pagination: data?.pagination,
    isLoading,
    isFetching,
    setSearch,
    setType,
    setBrand,
    setInStock,
    setPage,
    clearFilters,
  };
}
