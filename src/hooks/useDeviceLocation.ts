import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import type { Coordinate } from '@/types/api';

/**
 * Os três desfechos que o RF-43 manda tratar, mais os estados de transição.
 *
 * `unavailable` é o caso que costuma ser esquecido: a pessoa concedeu a
 * permissão, mas não há posição — GPS desligado, emulador sem coordenada
 * definida, ou o aparelho demorando demais para responder. Tratar isso como
 * "negado" mentiria sobre o que aconteceu; tratar como "carregando" deixaria a
 * tela presa para sempre.
 */
export type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; coordinate: Coordinate }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; reason: string };

/** Se o aparelho não responder nesse tempo, desistimos e seguimos sem posição. */
const POSITION_TIMEOUT_MS = 8000;

/** Até quando uma posição guardada ainda vale como "onde você está". */
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;

export function useDeviceLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  const request = useCallback(async () => {
    setState({ status: 'loading' });

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setState({ status: 'denied', canAskAgain: permission.canAskAgain });
      return;
    }

    // Permissão concedida não garante posição: o serviço de localização pode
    // estar desligado no aparelho.
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      setState({
        status: 'unavailable',
        reason: 'A localização do aparelho está desligada.',
      });
      return;
    }

    // Primeiro a última posição conhecida: ela volta na hora, sem acordar o GPS.
    // Serve para a lista já aparecer ordenada enquanto a posição fresca não
    // chega — e é a única posição que existe num emulador, que não produz
    // leituras novas sozinho.
    let hasPosition = false;
    try {
      const last = await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS });
      if (last) {
        hasPosition = true;
        setState({
          status: 'granted',
          coordinate: {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          },
        });
      }
    } catch {
      // Sem última posição conhecida não é erro: seguimos para a leitura fresca.
    }

    try {
      // O timeout existe para a tela nunca ficar presa em "Obtendo localização".
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), POSITION_TIMEOUT_MS),
        ),
      ]);

      setState({
        status: 'granted',
        coordinate: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    } catch {
      // Se a última conhecida já serviu, o timeout da leitura fresca não muda
      // nada para o usuário — a tela continua ordenada e não precisa avisar.
      if (hasPosition) return;

      setState({
        status: 'unavailable',
        reason: 'O aparelho não devolveu uma posição a tempo.',
      });
    }
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return { state, request, openSettings };
}
