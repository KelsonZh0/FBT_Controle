import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrderActions';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation, route }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const checkout = useCheckout();

  // O ponto escolhido chega de volta da tela de retirada pelos parâmetros da
  // rota. Sem ponto, o pedido segue como entrega — que continua sendo o padrão.
  const pickupPointId = route.params?.pickupPointId;
  const pickupPointName = route.params?.pickupPointName;

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Seu carrinho está vazio</Text>
        <Text style={styles.body}>Adicione produtos antes de finalizar o pedido.</Text>
        <Button label="Ver produtos" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />
      </View>
    );
  }

  function handleCheckout() {
    checkout.mutate(pickupPointId, {
      onSuccess: (order) => navigation.replace('OrderDetail', { id: order.id }),
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* RF-47: escolher retirada num ponto em vez de receber em casa. */}
            <View style={styles.pickupCard}>
              <View style={styles.pickupHeader}>
                <Ionicons
                  name={pickupPointId ? 'storefront' : 'home-outline'}
                  size={18}
                  color={colors.accent}
                />
                <Text style={styles.pickupTitle}>
                  {pickupPointId ? 'Retirada na loja' : 'Entrega no seu endereço'}
                </Text>
              </View>

              {pickupPointId ? (
                <>
                  <Text style={styles.pickupName}>{pickupPointName}</Text>
                  <View style={styles.pickupActions}>
                    <Button
                      label="Trocar ponto"
                      variant="ghost"
                      onPress={() => navigation.navigate('PickupPoints', { mode: 'select' })}
                    />
                    <Button
                      label="Receber em casa"
                      variant="ghost"
                      onPress={() => navigation.setParams({ pickupPointId: undefined, pickupPointName: undefined })}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.pickupHint}>
                    Prefere buscar? Dá para retirar num dos nossos pontos, sem custo de entrega.
                  </Text>
                  <Button
                    label="Escolher ponto de retirada"
                    variant="ghost"
                    onPress={() => navigation.navigate('PickupPoints', { mode: 'select' })}
                  />
                </>
              )}
            </View>

            <Text style={styles.heading}>Resumo do pedido</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub}>
                {item.quantity}x {money(item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.subtotal}>{money(item.subtotal)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: {money(cart?.total ?? 0)}</Text>
        {checkout.isError && (
          <Text style={styles.error}>{(checkout.error as ApiError).message}</Text>
        )}
        <Button
          label={checkout.isPending ? 'Criando pedido…' : 'Confirmar pedido'}
          onPress={handleCheckout}
          disabled={checkout.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10, backgroundColor: colors.white },
  title: { fontSize: 17, fontWeight: '700', color: colors.black, textAlign: 'center' },
  body: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 20 },
  list: { padding: 12, gap: 10 },
  heading: { fontSize: 16, fontWeight: '700', color: colors.black, marginBottom: 6 },
  headerBlock: { gap: 14, marginBottom: 4 },
  pickupCard: { backgroundColor: colors.grayLight, borderRadius: 12, padding: 12, gap: 8 },
  pickupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pickupTitle: { fontSize: 14, fontWeight: '700', color: colors.black },
  pickupName: { fontSize: 14, fontWeight: '600', color: colors.accent },
  pickupHint: { fontSize: 12, color: colors.gray, lineHeight: 18 },
  pickupActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
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
  subtotal: { fontSize: 14, fontWeight: '700', color: colors.black },
  footer: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: colors.border },
  total: { fontSize: 18, fontWeight: '800', color: colors.black, textAlign: 'right' },
  error: { fontSize: 13, color: colors.danger, textAlign: 'right' },
});
