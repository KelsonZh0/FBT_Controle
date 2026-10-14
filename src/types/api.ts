export type ProductType = 'SIMPLE' | 'VARIABLE';
export type ProductState = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  state: ProductState;
  brand: string | null;
  categoryId: string | null;
  priceFrom: number;
  priceTo: number;
  stock: number;
  image: string | null;
  variantsCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  minStock: number;
  isDefault: boolean;
  active: boolean;
  label: string | null;
  options: { option: string; value: string }[];
  images: ProductImage[];
}

/**
 * Média e contagem já vêm com o produto (RF-35). Nunca calcular isso no app a
 * partir da lista de avaliações: a lista é paginada, então a conta sairia
 * errada, e ainda custaria uma requisição por produto.
 */
export interface ProductRating {
  average: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  state: ProductState;
  description: string | null;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  tags: string[];
  options: { id: string; name: string; values: { id: string; value: string }[] }[];
  variants: ProductVariant[];
  images: ProductImage[];
  rating: ProductRating;
  createdAt: string;
}

export interface CartItem {
  variantId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO';

export type PaymentSimulate = 'approve' | 'decline';

// PENDING -> PAID ou PENDING -> CANCELLED (fluxo do comprador).
// FULFILLED/SHIPPED/DELIVERED são avanços feitos pela loja após o pagamento.
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FULFILLED' | 'SHIPPED' | 'DELIVERED';

export interface OrderItem {
  variantId: string;
  productName: string;
  variantName: string | null;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  status: string;
  method: PaymentMethod;
  amount: number;
  transactionId: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  payment: Payment | null;
  /** O ponto de retirada escolhido no checkout, ou `null` para entrega (RF-47). */
  pickup: OrderPickup | null;
  createdAt: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  createdAt: string;
  note?: string | null;
}

// ----------------------------------------------------------------------------
// Avaliações (RF-35 a RF-42)
// ----------------------------------------------------------------------------

export interface ReviewImage {
  id: string;
  url: string;
  mediaId: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: ReviewImage[];
  author: { id: string; name: string };
  verifiedPurchase: boolean;
  /** A loja pode ocultar uma avaliação pelo painel (RF-42). */
  hidden: boolean;
  /** Só vem `true` quando a listagem é feita com o token do cliente. */
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsPage extends Paginated<Review> {
  summary: ProductRating;
}

/**
 * Motivos que a API devolve. `NOT_PURCHASED` cobre tanto quem nunca comprou
 * quanto quem comprou e não pagou — o pedido precisa estar PAID.
 * O `| (string & {})` mantém a união aberta: se o backend passar a devolver um
 * motivo novo, o código continua compilando e cai no texto genérico.
 */
export type CanReviewReason = 'NOT_PURCHASED' | 'ALREADY_REVIEWED' | (string & {});

export interface CanReviewResponse {
  canReview: boolean;
  reason: CanReviewReason | null;
  /** Texto pronto da API. Usado só como último recurso (ver RF-37). */
  message: string;
  /** Preenchido quando o motivo é `ALREADY_REVIEWED`. */
  reviewId: string | null;
}

export interface CreateReviewInput {
  rating: number;
  title?: string;
  comment?: string;
  /** Ids obtidos em POST /uploads. Máximo de 5. */
  mediaIds?: string[];
}

/**
 * Resposta do POST /uploads. Atenção: o campo é `id`, não `mediaId`, apesar de
 * o enunciado chamá-lo assim. Ler `mediaId` aqui devolve `undefined` e a
 * avaliação é criada sem foto, sem nenhum erro visível.
 */
export interface UploadedMedia {
  id: string;
  kind: 'IMAGE' | 'VIDEO';
  url: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
  folder: string | null;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Retirada (RF-43 a RF-48)
// ----------------------------------------------------------------------------

export interface PickupAddress {
  cep: string | null;
  street: string | null;
  number: string | null;
  complement?: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: PickupAddress;
  coordinate: Coordinate;
  hours: string | null;
  active: boolean;
  /**
   * Só existe quando a busca envia latitude e longitude. Ser opcional é de
   * propósito: obriga toda tela a tratar o caso "sem posição" (RF-45).
   */
  distanceKm?: number;
}

export interface PickupPointsResponse {
  data: PickupPoint[];
  /** `null` quando a busca foi feita sem coordenadas. */
  origin: Coordinate | null;
}

/** O ponto escolhido, como volta dentro do pedido (RF-47). */
export type OrderPickup = Pick<PickupPoint, 'id' | 'name' | 'address' | 'coordinate' | 'hours'>;
