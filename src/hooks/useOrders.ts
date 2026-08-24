import { useQuery } from '@tanstack/react-query';
import { listOrders } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';

export function useOrders() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.orders.list(),
    queryFn: listOrders,
    enabled: isAuthenticated,
  });
}
