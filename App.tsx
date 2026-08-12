import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProductsScreen } from '@/screens/ProductsScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { CartScreen } from '@/screens/CartScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { CadastroScreen } from '@/screens/CadastroScreen';
import type { RootStackParamList } from '@/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { queryClient } from '@/lib/queryClient';
import { SessionProvider } from '@/session/session';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient} >
        <SessionProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: colors.white,
                headerTitleStyle: { fontWeight: '700' },
              }}
            >
              <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'FBT Controle Remoto' }} />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={({ route }) => ({ title: route.params.name })}
              />
              <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
              <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </SessionProvider>
      </QueryClientProvider>

    </SafeAreaProvider>
  );
}
