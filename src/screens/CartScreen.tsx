import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useCartMutations } from '@/hooks/useCartMutations';
import { useSession } from '@/session/session';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { isAuthenticated, customer, logout, isLoading: isSessionLoading } = useSession();
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const { setQuantity, removeItem } = useCartMutations();

  if (isSessionLoading) {
    return <Loading label="Carregando sessão…" />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Entre para ver seu carrinho</Text>
        <Text style={styles.body}>
          Você precisa estar logado para adicionar itens e finalizar a compra.
        </Text>
        <View style={styles.actions}>
          <Button label="Entrar" onPress={() => navigation.navigate('Login')} />
          <Button label="Criar conta" variant="ghost" onPress={() => navigation.navigate('Cadastro')} />
        </View>
      </View>
    );
  }

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🛒</Text>
        <Text style={styles.title}>Seu carrinho está vazio</Text>
        <Text style={styles.body}>Olá, {customer?.name}. Adicione produtos para vê-los aqui.</Text>
        <Button label="Ver produtos" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.hi}>Olá, {customer?.name}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub}>
                {money(item.unitPrice)} · subtotal {money(item.subtotal)}
              </Text>
            </View>
            <View style={styles.qtyBox}>
              <Text
                style={[styles.qtyBtn, setQuantity.isPending && styles.dim]}
                onPress={() =>
                  !setQuantity.isPending &&
                  setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity - 1 })
                }
              >
                −
              </Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text
                style={[styles.qtyBtn, setQuantity.isPending && styles.dim]}
                onPress={() =>
                  !setQuantity.isPending &&
                  setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity + 1 })
                }
              >
                +
              </Text>
            </View>
            <Text
              style={[styles.remove, removeItem.isPending && styles.dim]}
              onPress={() => !removeItem.isPending && removeItem.mutate(item.variantId)}
            >
              remover
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.total}>Total: {money(cart?.total ?? 0)}</Text>
            <Button label="Finalizar (checkout)" onPress={() => navigation.navigate('Checkout')} />
          </View>
        }
      />
      <View style={styles.signout}>
        <Button label="Sair" variant="ghost" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10, backgroundColor: colors.white },
  listContainer: { flex: 1, backgroundColor: colors.white },
  emoji: { fontSize: 48 },
  title: { fontSize: 17, fontWeight: '700', color: colors.black, textAlign: 'center' },
  body: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  list: { padding: 12, gap: 10 },
  hi: { fontSize: 14, color: colors.gray, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 10,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '600', color: colors.black },
  sub: { fontSize: 12, color: colors.gray },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { fontSize: 20, fontWeight: '700', color: colors.black, paddingHorizontal: 6 },
  qty: { fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center', color: colors.black },
  remove: { fontSize: 12, color: colors.danger, marginLeft: 6 },
  dim: { opacity: 0.4 },
  footer: { marginTop: 16, gap: 10 },
  total: { fontSize: 18, fontWeight: '800', color: colors.black, textAlign: 'right' },
  signout: { padding: 12 },
});
