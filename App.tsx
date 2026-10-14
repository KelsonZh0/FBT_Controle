import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';

import { ProductsScreen } from '@/screens/ProductsScreen';
import { CategoriasScreen } from '@/screens/CategoriasScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { PerfilScreen } from '@/screens/PerfilScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { ProductReviewsScreen } from '@/screens/ProductReviewsScreen';
import { PickupPointsScreen } from '@/screens/PickupPointsScreen';
import { CartScreen } from '@/screens/CartScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen';
import { OrderDetailScreen } from '@/screens/OrderDetailScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { CadastroScreen } from '@/screens/CadastroScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/screens/ResetPasswordScreen';
import { CartHeaderButton } from '@/components/CartHeaderButton';
import { FavoritesHeaderButton } from '@/components/FavoritesHeaderButton';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { navigationRef, type RootStackParamList, type TabParamList } from '@/navigation';
import { NotificationsProvider } from '@/notifications/NotificationsProvider';
import { queryClient } from '@/lib/queryClient';
import { SessionProvider } from '@/session/session';
import { FavoritesProvider } from '@/context/favorites';
import { colors } from '@/theme/colors';
import { View } from 'react-native';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Categorias: 'grid',
  Orders: 'receipt',
  Perfil: 'person',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof TabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={ProductsScreen}
        options={{
          title: 'FBT Controle Remoto',
          tabBarLabel: 'Home',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FavoritesHeaderButton />
              <CartHeaderButton />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{ title: 'Categorias', tabBarLabel: 'Categorias' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Meus pedidos', tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Perfil', tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <FavoritesProvider>
            <NotificationsProvider>
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator
                screenOptions={{
                  headerStyle: { backgroundColor: colors.primary },
                  headerTintColor: colors.white,
                  headerTitleStyle: { fontWeight: '700' },
                }}
              >
                <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                  options={({ route }) => ({ title: route.params.name ?? 'Produto' })}
                />
                <Stack.Screen
                  name="ProductReviews"
                  component={ProductReviewsScreen}
                  options={{ title: 'Avaliações' }}
                />
                <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
                <Stack.Screen
                  name="Favorites"
                  component={FavoritesScreen}
                  options={{ title: 'Meus Favoritos' }}
                />
                <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar pedido' }} />
                <Stack.Screen
                  name="PickupPoints"
                  component={PickupPointsScreen}
                  options={{ title: 'Pontos de retirada' }}
                />
                <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Pedido' }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
                <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPasswordScreen}
                  options={{ title: 'Esqueci minha senha' }}
                />
                <Stack.Screen
                  name="ResetPassword"
                  component={ResetPasswordScreen}
                  options={{ title: 'Nova senha' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
            </NotificationsProvider>
            <StatusBar style="light" />
          </FavoritesProvider>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
