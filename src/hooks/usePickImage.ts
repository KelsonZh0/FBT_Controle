import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { LocalImage } from '@/services/uploads';

/**
 * Desfechos possíveis do pedido de acesso à galeria (RF-40).
 *
 * `blocked` é diferente de `denied`: o sistema não vai mais perguntar, então
 * oferecer "tentar de novo" seria mentira — o único caminho é as configurações.
 */
export type GalleryPermission = 'unknown' | 'granted' | 'denied' | 'blocked';

/**
 * Escolhe uma imagem da galeria, pedindo a permissão no momento do toque —
 * não na abertura do app, quando a pessoa ainda não sabe o que ganha com isso.
 *
 * Nunca lança por permissão negada: devolve `null` e deixa o estado em
 * `permission` para a tela explicar o que foi perdido e seguir funcionando.
 */
export function usePickImage() {
  const [permission, setPermission] = useState<GalleryPermission>('unknown');

  const pick = useCallback(async (): Promise<LocalImage | null> => {
    const response = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!response.granted) {
      setPermission(response.canAskAgain ? 'denied' : 'blocked');
      return null;
    }

    setPermission('granted');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: false,
    });

    // Fechar o seletor sem escolher não é erro nem negativa de permissão.
    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    return { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType };
  }, []);

  /** Só faz sentido quando o estado é `blocked`. */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return { permission, pick, openSettings };
}
