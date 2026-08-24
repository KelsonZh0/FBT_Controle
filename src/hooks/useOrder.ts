import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';

export function useOrder(id: string) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: isAuthenticated && Boolean(id),
  });
}
