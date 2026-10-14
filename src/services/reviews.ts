import { http } from './http';
import type { CanReviewResponse, CreateReviewInput, Review, ReviewsPage } from '@/types/api';

export interface ListReviewsParams {
  page?: number;
  pageSize?: number;
  rating?: number;
  withPhotos?: boolean;
  sort?: 'recent' | 'rating_desc' | 'rating_asc';
}

/**
 * Lista as avaliações de um produto (RF-36).
 *
 * Vai autenticada quando há sessão, porque é o token do cliente que faz a API
 * marcar `isMine` na avaliação dele. Sem token a lista funciona, mas todas as
 * avaliações voltam com `isMine: false`.
 *
 * A loja pode ocultar avaliações pelo painel; as ocultas simplesmente não vêm
 * nesta resposta (RF-42), então não há nada a filtrar no app.
 */
export async function listReviews(productId: string, params: ListReviewsParams = {}): Promise<ReviewsPage> {
  const { data } = await http.get<ReviewsPage>(`/products/${productId}/reviews`, { params });
  return data;
}

/**
 * Pergunta ANTES de oferecer o formulário (RF-37). Descobrir no POST significa
 * deixar a pessoa escrever o texto e anexar a foto para só então ser recusada.
 */
export async function canReview(productId: string): Promise<CanReviewResponse> {
  const { data } = await http.get<CanReviewResponse>(`/products/${productId}/reviews/can-review`);
  return data;
}

/** Cria a avaliação. As fotos vão como ids já enviados em POST /uploads. */
export async function createReview(productId: string, input: CreateReviewInput): Promise<Review> {
  const { data } = await http.post<Review>(`/products/${productId}/reviews`, input);
  return data;
}
