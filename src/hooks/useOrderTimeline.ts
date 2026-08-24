import { useQuery } from '@tanstack/react-query';
import { getOrderTimeline } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';

export function useOrderTimeline(id: string) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.orders.timeline(id),
    queryFn: () => getOrderTimeline(id),
    enabled: isAuthenticated && Boolean(id),
  });
}
