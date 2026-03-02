import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { MOCK_ENABLED } from '@/app/lib/mock';
import { MOCK_ORDER } from '../data';

export function useOrderDetailHook(orderId: string) {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['orders', orderId],
    queryFn:  () => MOCK_ENABLED ? MOCK_ORDER : orderService.getById(orderId),
    enabled:  !!orderId,
    retry:    1,
  });

  return { order, isLoading, isError };
}
