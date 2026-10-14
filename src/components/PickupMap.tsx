import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { Coordinate, PickupPoint } from '@/types/api';
import { colors } from '@/theme/colors';

/**
 * Mapa com os pontos de retirada e a loja (RF-46).
 *
 * Por que WebView com Leaflet, e não `react-native-maps`:
 * o `react-native-maps` depende da Google Maps SDK for Android, cuja chave só é
 * lida em build nativo — no Expo Go a chave do app é ignorada e o mapa renderiza
 * sem nenhum tile (quadro em branco). Testamos em emulador e em aparelho físico,
 * com o mesmo resultado.
 *
 * Leaflet com tiles do OpenStreetMap não exige chave nenhuma e roda dentro de um
 * WebView, que o Expo Go suporta. O mapa é real, com marcadores reais, e o
 * projeto continua rodando com `npx expo start` numa máquina limpa — que é o
 * requisito não funcional que um development build colocaria em risco.
 *
 * Fica num arquivo próprio porque é a única parte da tela que depende de mapa:
 * se ele não puder ser mostrado, a lista de pontos continua inteira sem ele.
 */
export function PickupMap({
  points,
  store,
}: {
  points: PickupPoint[];
  store: Coordinate | null;
}) {
  const anchor = store ?? points[0]?.coordinate ?? null;

  // O HTML é montado a partir dos dados, então só precisa ser refeito quando
  // os pontos ou a loja mudarem — não a cada render da tela.
  const html = useMemo(() => (anchor ? buildMapHtml(points, store, anchor) : null), [
    points,
    store,
    anchor,
  ]);

  // Sem nenhuma coordenada não há mapa que faça sentido — e um mapa centrado no
  // meio do oceano é pior do que mapa nenhum.
  if (!html) return null;

  return (
    <View style={styles.wrapper}>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        javaScriptEnabled
        // Sem isto o Android bloqueia os tiles, que vêm de origem externa.
        mixedContentMode="always"
      />
      <Text style={styles.legend}>
        Alfinete azul: a loja. Alfinetes vermelhos: pontos de retirada.
      </Text>
    </View>
  );
}

/** Marcador desenhado em CSS, para não depender de imagem externa. */
function markerIcon(color: string): string {
  return `L.divIcon({
    className: '',
    html: '<div style="background:${color};width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 16],
  })`;
}

function buildMapHtml(points: PickupPoint[], store: Coordinate | null, anchor: Coordinate): string {
  // JSON.stringify escapa os textos, então nome com aspas ou acento não quebra
  // o script gerado.
  const markers = points
    .map(
      (point) => `L.marker([${point.coordinate.latitude}, ${point.coordinate.longitude}], { icon: ${markerIcon(colors.danger)} })
        .addTo(map)
        .bindPopup(${JSON.stringify(`<b>${point.name}</b>`)});`,
    )
    .join('\n');

  const storeMarker = store
    ? `L.marker([${store.latitude}, ${store.longitude}], { icon: ${markerIcon(colors.accent)} })
         .addTo(map)
         .bindPopup('<b>Nossa loja</b>');`
    : '';

  // Enquadra todos os marcadores; com um só, mantém um zoom de cidade.
  const allCoordinates = [
    ...(store ? [[store.latitude, store.longitude]] : []),
    ...points.map((p) => [p.coordinate.latitude, p.coordinate.longitude]),
  ];

  const fit =
    allCoordinates.length > 1
      ? `map.fitBounds(${JSON.stringify(allCoordinates)}, { padding: [30, 30] });`
      : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: ${colors.grayLight}; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${anchor.latitude}, ${anchor.longitude}], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    ${storeMarker}
    ${markers}
    ${fit}
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  map: { width: '100%', height: 220, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.grayLight },
  legend: { fontSize: 11, color: colors.gray, textAlign: 'center' },
});
