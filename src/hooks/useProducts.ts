import { listProducts, ListProductsParams } from "@/services/products";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    placeholderData: keepPreviousData,
  });
}