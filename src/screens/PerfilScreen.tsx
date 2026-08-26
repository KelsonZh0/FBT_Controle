import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { useFavorites } from '@/context/favorites';
import { Button, Loading } from '@/components/ui';
import type { RootStackParamList, TabParamList } from '@/navigation';
import { colors } from '@/theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Perfil'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function PerfilScreen({ navigation }: Props) {
  const { isAuthenticated, customer, logout, isLoading } = useSession();
  const { favoriteCount } = useFavorites();

  if (isLoading) {
    return <Loading label="Carregando perfil…" />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={64} color={colors.gray} />
        <Text style={styles.title}>Você não está logado</Text>
        <View style={styles.actions}>
          <Button label="Entrar" onPress={() => navigation.navigate('Login')} />
          <Button label="Criar conta" variant="ghost" onPress={() => navigation.navigate('Cadastro')} />
        </View>
        <Text
          style={[styles.menuItem, { marginTop: 16, width: '100%', textAlign: 'center' }]}
          onPress={() => navigation.navigate('Favorites')}
        >
          Meus favoritos {favoriteCount > 0 ? `(${favoriteCount})` : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={40} color={colors.white} />
      </View>
      <Text style={styles.name}>{customer?.name}</Text>
      <Text style={styles.email}>{customer?.email}</Text>

      <View style={styles.menu}>
        <Text style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
          Meus pedidos
        </Text>
        <Text style={styles.menuItem} onPress={() => navigation.navigate('Cart')}>
          Carrinho
        </Text>
        <Text style={styles.menuItem} onPress={() => navigation.navigate('Favorites')}>
          Meus favoritos {favoriteCount > 0 ? `(${favoriteCount})` : ''}
        </Text>
      </View>

      <Button label="Sair" variant="ghost" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: colors.white },
  container: { flex: 1, alignItems: 'center', padding: 32, gap: 4, backgroundColor: colors.white },
  title: { fontSize: 17, fontWeight: '700', color: colors.black, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.black },
  email: { fontSize: 13, color: colors.gray, marginBottom: 24 },
  menu: { width: '100%', gap: 8, marginBottom: 24 },
  menuItem: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    backgroundColor: colors.grayLight,
    borderRadius: 10,
    padding: 14,
    textAlign: 'left',
  },
});
