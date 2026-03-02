import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { MOCK_ENABLED } from '@/app/lib/mock';
import { MOCK_PRODUCTS } from '@/app/features/landing/data';
import type { Product, ProductQueryParams, PaginatedResponse } from '@/app/types/global.types';

const applyMockFilters = (params: ProductQueryParams): PaginatedResponse<Product> => {
  let filtered = [...MOCK_PRODUCTS];
  if (params.type)   filtered = filtered.filter(p => p.type === params.type);
  if (params.search) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(params.search!.toLowerCase()) ||
    p.brand.toLowerCase().includes(params.search!.toLowerCase())
  );
  if (params.inStock) filtered = filtered.filter(p => p.variants.some(v => v.stock > 0));
  const limit = params.limit ?? 12;
  const page  = params.page  ?? 1;
  const total = filtered.length;
  const start = (page - 1) * limit;
  return {
    content:    filtered.slice(start, start + limit),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const fetchProducts = async (params: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
  if (MOCK_ENABLED) return applyMockFilters(params);
  const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS, { params });
  if (Array.isArray(data)) {
    return { content: data, pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
  }
  return data;
};

const fetchProductById = async (id: string): Promise<Product> => {
  if (MOCK_ENABLED) {
    const found = MOCK_PRODUCTS.find(p => p.id === id);
    if (found) return found;
  }
  const { data } = await axiosInstance.get(`${API_ENDPOINTS.PRODUCT}/${id}`);
  return data?.content ?? data;
};

interface UseProductsQueryOptions {
  queryParams?: ProductQueryParams;
  enabled?: boolean;
}

export const useProductsQuery = ({ queryParams = {}, enabled = true }: UseProductsQueryOptions = {}) =>
  useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', queryParams],
    queryFn:  () => fetchProducts(queryParams),
    enabled,
  });

export const useProductByIdQuery = (id: string, enabled = true) =>
  useQuery<Product>({
    queryKey: ['products', id],
    queryFn:  () => fetchProductById(id),
    enabled:  enabled && !!id,
  });
