import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrders } from '@/hooks/useOrders';
import { useSession } from '@/session/session';
import { money } from '@/lib/format';
import { statusColor, statusLabel } from '@/lib/orderStatus';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList, TabParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Orders'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OrdersScreen({ navigation }: Props) {
  const { isAuthenticated } = useSession();
  const { data: orders, isLoading, isError, error, refetch } = useOrders();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Entre para ver seus pedidos</Text>
        <Button label="Entrar" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  if (isLoading) return <Loading label="Carregando pedidos…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = orders ?? [];

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🧾</Text>
        <Text style={styles.title}>Você ainda não tem pedidos</Text>
        <Button label="Ver produtos" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>Pedido #{item.id.slice(0, 8)}</Text>
            <Text style={[styles.status, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
          </View>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
          <Text style={styles.total}>{money(item.total)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10, backgroundColor: colors.white },
  emoji: { fontSize: 48 },
  title: { fontSize: 17, fontWeight: '700', color: colors.black, textAlign: 'center' },
  list: { padding: 12, gap: 10 },
  card: { backgroundColor: colors.grayLight, borderRadius: 12, padding: 14, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '700', color: colors.black },
  status: { fontSize: 13, fontWeight: '700' },
  date: { fontSize: 12, color: colors.gray },
  total: { fontSize: 16, fontWeight: '800', color: colors.black, marginTop: 4 },
});
