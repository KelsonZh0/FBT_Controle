import { listProducts, ListProductsParams } from "@/services/products";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const response = await listProducts(params);

      return response.data;
    }
  })
}