import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { MOCK_ENABLED } from '@/app/lib/mock';
import { MOCK_PRODUCTS } from '@/app/features/landing/data';
import { parseProductId } from '@/app/helpers/productUrl';
import type { Product, ProductQueryParams, PaginatedResponse } from '@/app/types/global.types';

/** Extract ml value from variation — tries measureValue, ml, name, or optionValues */
const extractMl = (v: any): number => {
  if (v.measureValue) return Number(v.measureValue);
  if (v.ml) return Number(v.ml);
  // Try parsing from name like "100ml"
  const nameMatch = (v.name ?? '').match(/(\d+)\s*ml/i);
  if (nameMatch) return Number(nameMatch[1]);
  // Try parsing from optionValues
  if (v.optionValues?.length) {
    for (const ov of v.optionValues) {
      const m = (ov.value ?? ov.displayName ?? '').match(/(\d+)\s*ml/i);
      if (m) return Number(m[1]);
    }
  }
  return 0;
};

/** Extract image URLs in admin gallery order (1 = card, 2 = hover). */
const extractImages = (images: any): string[] => {
  if (!images || !Array.isArray(images)) return [];
  const urls = [...images]
    .filter((img: any) => img && (typeof img === 'string' || (img.url && img.isActive !== false)))
    .sort((a: any, b: any) => {
      if (typeof a === 'string' || typeof b === 'string') return 0;
      return (
        Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0) ||
        Number(a.id ?? 0) - Number(b.id ?? 0)
      );
    })
    .map((img: any) => (typeof img === 'string' ? img : img.url))
    .filter(Boolean) as string[];
  return [...new Set(urls)];
};

/** Maps backend product shape to frontend Product interface */
export const mapProduct = (raw: any): Product => {
  const imageList = extractImages(raw.images);
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    description: raw.description ?? '',
    image: imageList[0] || raw.image || raw.imageUrl || '',
    images: imageList.length > 0 ? imageList : [raw.imageUrl].filter(Boolean),
    variants: (raw.variations ?? raw.variants ?? []).map((v: any) => ({
      id: String(v.id),
      ml: Number(v.mlSize ?? extractMl(v)),
      price: Number(v.price ?? 0),
      mlSize: Number(v.mlSize ?? extractMl(v)),
      isFullBottle: v.isFullBottle ?? false,
      availableQuantity: Number(v.availableQuantity ?? 0),
      images: extractImages(v.images),
    })),
    variationsCount: raw.variationsCount ?? (raw.variations ?? raw.variants ?? []).length,
    // El backend serializa los decimales como string ("100.00"): sin Number()
    // las sumas de ml se concatenan ("96.00" + 200 → "96.00200") y la regla de
    // stock frasco/decant deja de funcionar.
    totalMl: Number(raw.totalMl ?? 100),
    openBottleMlRemaining: Number(raw.openBottleMlRemaining ?? 0),
    availableMl: Number(raw.availableMl ?? 0),
    isActive: raw.isActive ?? true,
    isPurchasable: raw.isPurchasable !== false,
    bajoPedido: raw.bajoPedido ?? false,
    gender: raw.gender ?? undefined,
    timeOfDay: raw.timeOfDay ?? undefined,
    concentration: raw.concentration ?? undefined,
    projection: raw.projection ?? undefined,
    discount: raw.discount ? Number(raw.discount) : undefined,
    detailDescription: raw.detailDescription ?? undefined,
    benefits: (() => {
      if (!raw.benefits) return undefined;
      try { const parsed = JSON.parse(raw.benefits); return Array.isArray(parsed) ? parsed : undefined; }
      catch { return undefined; }
    })(),
    stock: raw.stock != null ? Number(raw.stock) : undefined,
    price: raw.price ? Number(raw.price) : undefined,
    minFormatPrice: raw.minFormatPrice != null ? Number(raw.minFormatPrice) : undefined,
    maxFormatPrice: raw.maxFormatPrice != null ? Number(raw.maxFormatPrice) : undefined,
    formats: Array.isArray(raw.formats)
      ? raw.formats.map((f: any) => ({
          id: String(f.id),
          ml: Number(f.ml),
          price: Number(f.price),
          isFullBottle: !!f.isFullBottle,
          imageUrl: f.imageUrl ?? undefined,
        }))
      : undefined,
    categoryId: raw.categoryId != null ? Number(raw.categoryId) : (raw.marca?.categoryId != null ? Number(raw.marca.categoryId) : undefined),
    marcaId: raw.marcaId != null ? Number(raw.marcaId) : undefined,
    marca: raw.marca?.name
      ? {
          id: Number(raw.marca.id ?? raw.marcaId ?? 0),
          name: raw.marca.name,
          slug: raw.marca.slug ?? undefined,
        }
      : undefined,
    createdAt: raw.createdAt ?? '',
    // ── PDP editorial ──
    scentProfileTitle: raw.scentProfileTitle ?? undefined,
    scentSections: Array.isArray(raw.scentSections) ? raw.scentSections : undefined,
    mood: Array.isArray(raw.mood) ? raw.mood : undefined,
    occasion: Array.isArray(raw.occasion) ? raw.occasion : undefined,
    longevity: raw.longevity != null ? Number(raw.longevity) : undefined,
    projectionScore: raw.projectionScore != null ? Number(raw.projectionScore) : undefined,
    signatureTitle: raw.signatureTitle ?? undefined,
    signatureDescription: raw.signatureDescription ?? undefined,
    signatureImageUrl: raw.signatureImageUrl ?? undefined,
  };
};

const applyMockFilters = (params: ProductQueryParams): PaginatedResponse<Product> => {
  let filtered = [...MOCK_PRODUCTS];
  if (params.search) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(params.search!.toLowerCase())
  );
  if (params.inStock) filtered = filtered.filter(p => p.variants.some(v => v.availableQuantity > 0));
  if (params.bajoPedido !== undefined) filtered = filtered.filter(p => p.bajoPedido === (String(params.bajoPedido) === 'true'));
  if (params.hasDiscount) filtered = filtered.filter(p => (p.discount ?? 0) > 0);
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(p => (p.price ?? 0) >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(p => (p.price ?? 0) <= params.maxPrice!);
  }
  if (params.gender) filtered = filtered.filter(p => p.gender === params.gender);
  if (params.sortBy === 'createdAt') {
    filtered.sort((a, b) =>
      params.sortOrder === 'ASC'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (params.sortBy === 'price') {
    filtered.sort((a, b) =>
      params.sortOrder === 'ASC'
        ? (a.price ?? 0) - (b.price ?? 0)
        : (b.price ?? 0) - (a.price ?? 0)
    );
  }
  const limit = params.limit ?? 12;
  const page  = params.page  ?? 1;
  const total = filtered.length;
  const start = (page - 1) * limit;
  return {
    content:    filtered.slice(start, start + limit),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const fetchProducts = async (params: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
  if (MOCK_ENABLED) return applyMockFilters(params);
  try {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS, { params });

    // Backend returns: { statusCode, message, data: { data: [...], total, page, limit, totalPages }, ... }
    const responseData = data?.data ?? data;

    if (Array.isArray(responseData)) {
      return { content: responseData.map(mapProduct), pagination: { page: 1, limit: responseData.length, total: responseData.length, totalPages: 1 } };
    }

    if (responseData?.content) {
      return {
        ...responseData,
        content: responseData.content.map(mapProduct),
      };
    }

    // Map backend response format to expected format
    if (responseData?.data && Array.isArray(responseData.data)) {
      return {
        content: responseData.data.map(mapProduct),
        pagination: {
          page: responseData.page ?? 1,
          limit: responseData.limit ?? 20,
          total: responseData.total ?? 0,
          totalPages: responseData.totalPages ?? 1,
        },
      };
    }

    return responseData || applyMockFilters(params);
  } catch (error: any) {
    console.error('[fetchProducts] API error — falling back to mock filters:', error?.response?.status, error?.response?.data ?? error?.message);
    return applyMockFilters(params);
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  // La ruta pública es /producto/{id}-{slug}: resolver por el id numérico.
  const numericId = parseProductId(id);
  if (MOCK_ENABLED) {
    const found = MOCK_PRODUCTS.find(p => p.id === numericId);
    if (found) return found;
  }
  try {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.PRODUCT}/${numericId}`);
    // Backend returns: { statusCode, message, data: Product, ... }
    const productData = data?.data ?? data;
    if (productData && typeof productData === 'object') {
      return mapProduct(productData);
    }
    return mapProduct(data);
  } catch (error) {
    console.warn(`Error fetching product ${numericId}:`, error);
    return MOCK_PRODUCTS.find(p => p.id === numericId) ?? MOCK_PRODUCTS[0];
  }
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
