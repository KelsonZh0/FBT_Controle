import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, checkout, payOrder } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import type { Order, PaymentMethod, PaymentSimulate } from '@/types/api';

// Pagamento NÃO é otimista: a resposta do servidor é que decide o status.
// (diferente do carrinho, que é otimista — ver useCartMutations)

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkout,
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; method: PaymentMethod; simulate?: PaymentSimulate }) =>
      payOrder(v.id, v.method, v.simulate),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
    },
  });
}
