import type { ListProductsParams } from '@/services/products';
import type { ListReviewsParams } from '@/services/reviews';
import type { ListPickupPointsParams } from '@/services/pickupPoints';

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: ListProductsParams) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => ['orders', 'list'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    timeline: (id: string) => ['orders', 'timeline', id] as const,
  },
  brands: {
    all: ['brands'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  reviews: {
    /** Tudo de avaliações de um produto — usado para invalidar de uma vez (RF-41). */
    ofProduct: (productId: string) => ['reviews', productId] as const,
    list: (productId: string, params: ListReviewsParams) =>
      ['reviews', productId, 'list', params] as const,
    canReview: (productId: string) => ['reviews', productId, 'can-review'] as const,
  },
  pickupPoints: {
    all: ['pickup-points'] as const,
    list: (params: ListPickupPointsParams) => ['pickup-points', 'list', params] as const,
  },
};
