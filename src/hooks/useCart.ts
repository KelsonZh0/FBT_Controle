import { getCart } from "@/services/cart";
import { useQuery } from "@tanstack/react-query";

export function useCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: options?.enabled ?? true,
  })
}