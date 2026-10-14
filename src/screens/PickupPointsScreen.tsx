import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { usePickupPoints } from '@/hooks/usePickupPoints';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Button, ErrorState, Loading } from '@/components/ui';
import { AnimatedListItem } from '@/components/motion';
import { PickupMap } from '@/components/PickupMap';
import type { RootStackParamList } from '@/navigation';
import { ApiError, type PickupPoint } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PickupPoints'>;

export function PickupPointsScreen({ route, navigation }: Props) {
  const selecting = route.params?.mode === 'select';
  const location = useDeviceLocation();
  const store = useStoreSettings();

  // A posição é pedida ao abrir a tela — este é o momento certo: a pessoa já
  // disse que quer ver pontos de retirada, então o motivo do pedido é óbvio.
  useEffect(() => {
    location.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coordinate = location.state.status === 'granted' ? location.state.coordinate : undefined;

  // A lista é buscada de qualquer jeito, mesmo enquanto a posição não chega.
  // É isso que impede a tela de ficar presa em "Obtendo localização": o
  // conteúdo aparece primeiro, e a ordenação entra depois, se entrar.
  const points = usePickupPoints(
    coordinate ? { latitude: coordinate.latitude, longitude: coordinate.longitude } : {},
  );

  const storeCoordinate =
    store.data?.latitude != null && store.data?.longitude != null
      ? { latitude: store.data.latitude, longitude: store.data.longitude }
      : null;

  function handleChoose(point: PickupPoint) {
    // Devolve a escolha para o checkout, que já está na pilha (RF-47).
    navigation.navigate('Checkout', { pickupPointId: point.id, pickupPointName: point.name });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LocationBanner
        state={location.state}
        onRetry={location.request}
        onOpenSettings={location.openSettings}
      />

      {/* RF-48: os três estados da lista. */}
      {points.isLoading ? (
        <Loading label="Carregando pontos de retirada…" />
      ) : points.isError ? (
        <ErrorState
          message={points.error instanceof ApiError ? points.error.message : 'Falha ao carregar.'}
          onRetry={() => points.refetch()}
        />
      ) : !points.data || points.data.data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="storefront-outline" size={44} color={colors.gray} />
          <Text style={styles.emptyTitle}>Nenhum ponto de retirada</Text>
          <Text style={styles.emptyBody}>
            Esta loja ainda não cadastrou pontos de retirada. Seu pedido pode ser finalizado com
            entrega normalmente.
          </Text>
        </View>
      ) : (
        <>
          {/* RF-46: mapa com os pontos e a loja. */}
          <PickupMap points={points.data.data} store={storeCoordinate} />

          {points.data.data.map((point, index) => (
            <AnimatedListItem key={point.id} index={index}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{point.name}</Text>
                  {/* RF-44: a distância aparece na tela — quando existe. */}
                  {point.distanceKm != null && (
                    <View style={styles.distanceTag}>
                      <Ionicons name="navigate" size={12} color={colors.accent} />
                      <Text style={styles.distanceText}>{point.distanceKm.toFixed(1)} km</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.address}>{formatAddress(point)}</Text>
                {point.hours && (
                  <View style={styles.hoursRow}>
                    <Ionicons name="time-outline" size={13} color={colors.gray} />
                    <Text style={styles.hours}>{point.hours}</Text>
                  </View>
                )}

                {selecting && (
                  <Button label="Retirar aqui" onPress={() => handleChoose(point)} />
                )}
              </View>
            </AnimatedListItem>
          ))}
        </>
      )}
    </ScrollView>
  );
}

/**
 * O estado da permissão, dito em voz alta (RF-43 e RF-45).
 *
 * Em nenhum dos desfechos a lista some: o que muda é a explicação e o caminho
 * para tentar de novo.
 */
function LocationBanner({
  state,
  onRetry,
  onOpenSettings,
}: {
  state: ReturnType<typeof useDeviceLocation>['state'];
  onRetry: () => void;
  onOpenSettings: () => void;
}) {
  if (state.status === 'granted') {
    return (
      <View style={[styles.banner, styles.bannerOk]}>
        <Ionicons name="navigate-circle" size={18} color={colors.accent} />
        <Text style={styles.bannerText}>Ordenados do mais perto para o mais longe de você.</Text>
      </View>
    );
  }

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <View style={styles.banner}>
        <Ionicons name="locate" size={18} color={colors.gray} />
        <Text style={styles.bannerText}>
          Procurando sua localização para ordenar por distância. A lista já está abaixo.
        </Text>
      </View>
    );
  }

  if (state.status === 'denied') {
    return (
      <View style={styles.banner}>
        <Ionicons name="location-outline" size={18} color={colors.gray} />
        <View style={styles.bannerBody}>
          <Text style={styles.bannerText}>
            Sem acesso à sua localização, os pontos aparecem na ordem de cadastro e sem a distância.
            Todos continuam disponíveis para retirada.
          </Text>
          {state.canAskAgain ? (
            <Button label="Permitir localização" variant="ghost" onPress={onRetry} />
          ) : (
            <Button label="Abrir configurações" variant="ghost" onPress={onOpenSettings} />
          )}
        </View>
      </View>
    );
  }

  // 'unavailable': permissão concedida, mas sem posição.
  return (
    <View style={styles.banner}>
      <Ionicons name="warning-outline" size={18} color={colors.gray} />
      <View style={styles.bannerBody}>
        <Text style={styles.bannerText}>
          {state.reason} Por isso a lista está sem ordenação por distância — mas os pontos são estes
          mesmos.
        </Text>
        <Button label="Tentar de novo" variant="ghost" onPress={onRetry} />
      </View>
    </View>
  );
}

function formatAddress(point: PickupPoint): string {
  const { street, number, district, city, state } = point.address;
  const line = [street, number].filter(Boolean).join(', ');
  const region = [district, city, state].filter(Boolean).join(' · ');
  return [line, region].filter(Boolean).join(' — ') || 'Endereço não informado';
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: colors.white },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 12,
  },
  bannerOk: { backgroundColor: '#eef4ff' },
  bannerBody: { flex: 1, gap: 8 },
  bannerText: { flex: 1, fontSize: 12, color: colors.gray, lineHeight: 18 },

  card: { backgroundColor: colors.grayLight, borderRadius: 12, padding: 12, gap: 6, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.black },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  distanceText: { fontSize: 11, fontWeight: '700', color: colors.accent },
  address: { fontSize: 13, color: colors.gray, lineHeight: 18 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hours: { fontSize: 12, color: colors.gray },

  empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.black },
  emptyBody: { fontSize: 13, color: colors.gray, textAlign: 'center', lineHeight: 19 },
});
