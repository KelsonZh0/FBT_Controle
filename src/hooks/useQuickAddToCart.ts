import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct } from '@/services/products';
import { queryKeys } from '@/lib/queryKeys';
import { useCartMutations } from './useCartMutations';
import type { ProductSummary } from '@/types/api';

// Só serve para produtos SIMPLE (variante única). Produtos VARIABLE precisam
// que o cliente escolha a variante na ProductDetailScreen antes de adicionar.
export function useQuickAddToCart() {
  const queryClient = useQueryClient();
  const { addItem } = useCartMutations();

  const mutation = useMutation({
    mutationFn: async (product: ProductSummary) => {
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.products.detail(product.id),
        queryFn: () => getProduct(product.id),
      });
      const variant = full.variants.find((v) => v.isDefault) ?? full.variants[0];
      if (!variant) throw new Error('Produto sem variante disponível.');
      await addItem.mutateAsync({
        variantId: variant.id,
        quantity: 1,
        name: product.name,
        unitPrice: variant.price,
      });
    },
  });

  return { ...mutation, isPending: mutation.isPending || addItem.isPending };
}
