import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import type { Coordinate, PickupPoint } from '@/types/api';
import { colors } from '@/theme/colors';

/**
 * Mapa com os pontos de retirada e a loja (RF-46).
 *
 * Fica num arquivo próprio porque é a única parte da tela que depende de mapa
 * nativo: se o mapa não puder ser mostrado, a lista de pontos continua inteira
 * sem ele.
 */
export function PickupMap({
  points,
  store,
  selectedId,
  onSelect,
}: {
  points: PickupPoint[];
  store: Coordinate | null;
  selectedId?: string | null;
  onSelect?: (point: PickupPoint) => void;
}) {
  const anchor = store ?? points[0]?.coordinate;

  // Sem nenhuma coordenada não há mapa que faça sentido — e um mapa centrado no
  // meio do oceano é pior do que mapa nenhum.
  if (!anchor) return null;

  return (
    <View style={styles.wrapper}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: anchor.latitude,
          longitude: anchor.longitude,
          // Abertura larga o bastante para caber os pontos espalhados pela cidade.
          latitudeDelta: 0.35,
          longitudeDelta: 0.35,
        }}
      >
        {store && (
          <Marker
            coordinate={store}
            title="Nossa loja"
            pinColor={colors.accent}
            identifier="store"
          />
        )}

        {points.map((point) => (
          <Marker
            key={point.id}
            identifier={point.id}
            coordinate={point.coordinate}
            title={point.name}
            description={point.address.district ?? point.address.city ?? undefined}
            pinColor={point.id === selectedId ? colors.yellow : colors.danger}
            onPress={() => onSelect?.(point)}
          />
        ))}
      </MapView>

      <Text style={styles.legend}>
        Alfinete azul: a loja. Demais alfinetes: pontos de retirada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  map: { width: '100%', height: 220, borderRadius: 14 },
  legend: { fontSize: 11, color: colors.gray, textAlign: 'center' },
});
