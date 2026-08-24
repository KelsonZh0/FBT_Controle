import { useQuery } from '@tanstack/react-query';
import { listCategories } from '@/services/categories';
import { queryKeys } from '@/lib/queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: listCategories,
  });
}
