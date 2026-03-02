import type { ProductType, ProductQueryParams } from '@/app/types/global.types';

export interface CatalogFilters {
  search: string;
  type: ProductType | '';
  brand: string;
  inStock: boolean;
  page: number;
  sortBy: ProductQueryParams['sortBy'];
  order: 'asc' | 'desc';
}
