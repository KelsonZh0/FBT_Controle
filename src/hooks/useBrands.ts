import { useQuery } from '@tanstack/react-query';
import { listBrands } from '@/services/brands';
import { queryKeys } from '@/lib/queryKeys';

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands.all,
    queryFn: listBrands,
  });
}
