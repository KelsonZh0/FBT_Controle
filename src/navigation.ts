import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: { categoryId?: string } | undefined;
  Categorias: undefined;
  Orders: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  ProductDetail: { id: string; name: string };
  Cart: undefined;
  Favorites: undefined;
  Checkout: undefined;
  OrderDetail: { id: string };
  Login: undefined;
  Cadastro: undefined;
  ForgotPassword: { email?: string } | undefined;
  ResetPassword: { email: string };
};
