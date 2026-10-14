import { createNavigationContainerRef, type NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: { categoryId?: string } | undefined;
  Categorias: undefined;
  Orders: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  // `name` é opcional porque o deep link da notificação traz só o id do
  // produto — o nome real aparece assim que o detalhe carrega.
  ProductDetail: { id: string; name?: string };
  ProductReviews: { productId: string; productName: string };
  Cart: undefined;
  Favorites: undefined;
  Checkout: { pickupPointId?: string; pickupPointName?: string } | undefined;
  PickupPoints: { mode?: 'browse' | 'select' } | undefined;
  OrderDetail: { id: string };
  Login: undefined;
  Cadastro: undefined;
  ForgotPassword: { email?: string } | undefined;
  ResetPassword: { email: string };
};

/**
 * Referência da navegação para quem precisa navegar de fora de uma tela — hoje,
 * o toque numa notificação, que chega pelo módulo de notificações e não por um
 * componente montado dentro do navegador.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
