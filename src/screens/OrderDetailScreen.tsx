import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrder } from '@/hooks/useOrder';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { useCancelOrder, usePayOrder } from '@/hooks/useOrderActions';
import { money } from '@/lib/format';
import { statusColor, statusLabel } from '@/lib/orderStatus';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, PaymentMethod } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const METHODS: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'BOLETO'];

export function OrderDetailScreen({ route }: Props) {
  const { id } = route.params;
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const { data: timeline } = useOrderTimeline(id);
  const payOrder = usePayOrder();
  const cancelOrder = useCancelOrder();

  const [method, setMethod] = useState<PaymentMethod>('PIX');

  if (isLoading) return <Loading label="Carregando pedido…" />;
  if (isError || !order) {
    return <ErrorState message={(error as ApiError)?.message ?? 'Falha'} onRetry={() => refetch()} />;
  }

  const isPending = order.status === 'PENDING';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>Pedido #{order.id.slice(0, 8)}</Text>
        <Text style={[styles.status, { color: statusColor(order.status) }]}>{statusLabel(order.status)}</Text>
      </View>
      <Text style={styles.date}>{new Date(order.createdAt).toLocaleString('pt-BR')}</Text>

      <View style={styles.itemsBox}>
        {order.items.map((item) => (
          <View key={item.variantId} style={styles.itemRow}>
            <View style={styles.info}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productName}
                {item.variantName ? ` (${item.variantName})` : ''}
              </Text>
              <Text style={styles.sub}>
                {item.quantity}x {money(item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.subtotal}>{money(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>Total: {money(order.total)}</Text>

      {isPending && (
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Pagamento</Text>

          {order.payment && (
            <Text style={styles.hint}>Última tentativa: {order.payment.method} · {order.payment.status}</Text>
          )}

          <View style={styles.methodRow}>
            {METHODS.map((m) => (
              <Text
                key={m}
                onPress={() => setMethod(m)}
                style={[styles.chip, method === m && styles.chipActive]}
              >
                {m}
              </Text>
            ))}
          </View>

          {payOrder.isError && <Text style={styles.errorText}>{(payOrder.error as ApiError).message}</Text>}

          <Button
            label={payOrder.isPending ? 'Processando…' : 'Pagar (aprovar)'}
            onPress={() => payOrder.mutate({ id, method, simulate: 'approve' })}
            disabled={payOrder.isPending}
          />
          <Button
            label="Simular recusa"
            variant="ghost"
            onPress={() => payOrder.mutate({ id, method, simulate: 'decline' })}
            disabled={payOrder.isPending}
          />

          {cancelOrder.isError && <Text style={styles.errorText}>{(cancelOrder.error as ApiError).message}</Text>}

          <Button
            label={cancelOrder.isPending ? 'Cancelando…' : 'Cancelar pedido'}
            variant="ghost"
            onPress={() => cancelOrder.mutate(id)}
            disabled={cancelOrder.isPending || payOrder.isPending}
          />
        </View>
      )}

      {!isPending && order.payment && (
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Pagamento</Text>
          <Text style={styles.hint}>
            {order.payment.method} · {order.payment.status}
          </Text>
        </View>
      )}

      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Linha do tempo</Text>
        {!timeline || timeline.length === 0 ? (
          <Text style={styles.hint}>Sem eventos registrados ainda.</Text>
        ) : (
          timeline.map((entry, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <Text style={[styles.timelineStatus, { color: statusColor(entry.status) }]}>
                {statusLabel(entry.status)}
              </Text>
              <Text style={styles.hint}>{new Date(entry.createdAt).toLocaleString('pt-BR')}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 18, fontWeight: '700', color: colors.black },
  status: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 12, color: colors.gray },
  itemsBox: { gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.grayLight, borderRadius: 12, padding: 10 },
  info: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.black },
  sub: { fontSize: 12, color: colors.gray },
  subtotal: { fontSize: 14, fontWeight: '700', color: colors.black },
  total: { fontSize: 18, fontWeight: '800', color: colors.black, textAlign: 'right' },
  box: { gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.black },
  hint: { fontSize: 13, color: colors.gray },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.black,
    overflow: 'hidden',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary, color: colors.white },
  errorText: { fontSize: 13, color: colors.danger },
  timelineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  timelineStatus: { fontSize: 13, fontWeight: '700' },
});
