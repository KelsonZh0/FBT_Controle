import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { canReview, createReview, listReviews, type ListReviewsParams } from '@/services/reviews';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';
import type { CreateReviewInput, Review } from '@/types/api';

/** Lista de avaliações do produto (RF-36). */
export function useProductReviews(productId: string, params: ListReviewsParams = {}) {
  return useQuery({
    queryKey: queryKeys.reviews.list(productId, params),
    queryFn: () => listReviews(productId, params),
    enabled: Boolean(productId),
  });
}

/**
 * Pergunta se o cliente pode avaliar (RF-37).
 *
 * Só roda com sessão aberta: sem token a API responde 401, e "não está logado"
 * é um estado que a tela já sabe tratar sem precisar de requisição.
 */
export function useCanReview(productId: string) {
  const { isAuthenticated } = useSession();

  return useQuery({
    queryKey: queryKeys.reviews.canReview(productId),
    queryFn: () => canReview(productId),
    enabled: Boolean(productId) && isAuthenticated,
  });
}

/**
 * Envia a avaliação e faz a tela se atualizar sozinha (RF-41).
 *
 * Invalida duas coisas: as avaliações do produto (a lista) e o detalhe do
 * produto (de onde vêm a média e a contagem do RF-35). Sem o segundo, a lista
 * ganharia o item novo mas o cabeçalho continuaria com a média velha até o
 * usuário sair e voltar.
 */
export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(productId, input),
    onSuccess: (_review: Review) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.ofProduct(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
    },
  });
}
