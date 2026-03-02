import { useBannersQuery } from '@/app/tanstack-queries/bannersQuery';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';

export function useHomeHook() {
  const { data: bannersData, isLoading: bannersLoading } = useBannersQuery();

  const { data: featuredData, isLoading: featuredLoading } = useProductsQuery({
    queryParams: { limit: 8, sortBy: 'createdAt', order: 'desc' },
  });

  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useProductsQuery({
    queryParams: { limit: 4, sortBy: 'createdAt', order: 'desc', page: 1 },
  });

  return {
    banners: bannersData ?? [],
    bannersLoading,

    featuredProducts: featuredData?.content ?? [],
    featuredLoading,

    newArrivals: newArrivalsData?.content ?? [],
    newArrivalsLoading,
  };
}
