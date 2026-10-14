import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Por que os imports são profundos, e não `from 'expo-notifications'`:
 *
 * O índice do pacote reexporta `DevicePushTokenAutoRegistration.fx`, um módulo
 * de efeito colateral que chama `addPushTokenListener` assim que é carregado.
 * Esse listener passa por `warnOfExpoGoPushUsage()`, que no Android dentro do
 * Expo Go **lança exceção** — push remoto foi removido do Expo Go no SDK 53.
 *
 * Resultado: só de importar o pacote pelo caminho normal, o app quebra na
 * abertura, mesmo usando apenas notificação local. Importando os módulos
 * locais diretamente, nada disso é carregado e o Caminho B funciona no Expo Go,
 * como o enunciado prevê. O pacote não declara `exports` no package.json,
 * então esses caminhos são válidos.
 */
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import type { NotificationPermissionsStatus } from 'expo-notifications/build/NotificationPermissions.types';
import type { PushMessage } from '@/services/push';

/**
 * Caminho B do checkpoint: notificação local agendada pelo próprio app.
 *
 * Por que o B e não o A: o `GET /push/status` da nossa loja responde
 * `enabled: false` — não há credencial de FCM no servidor, então todo envio
 * real responderia 503. O Caminho B roda no Expo Go e vale a mesma nota.
 */

/** Canal do Android (RF-58). Sem canal, o Android 8+ silencia a notificação. */
export const ANDROID_CHANNEL_ID = 'avisos-da-loja';

const LAST_SEEN_KEY = 'fbt_push_last_seen';
const OPT_IN_KEY = 'fbt_push_opt_in';

/**
 * Como a notificação se comporta com o app aberto.
 *
 * `shouldShowAlert` está depreciado nesta versão — quem seguir tutorial antigo
 * escreve código que compila e não mostra nada. O par certo agora é
 * `shouldShowBanner` + `shouldShowList`.
 */
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPermission = 'unknown' | 'granted' | 'denied' | 'blocked';

function toPermission(response: NotificationPermissionsStatus): NotificationPermission {
  if (response.granted) return 'granted';
  return response.canAskAgain ? 'denied' : 'blocked';
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const response = await getPermissionsAsync();
  return toPermission(response);
}

/**
 * Pede a permissão. Deve ser chamado a partir de uma ação explícita da pessoa
 * (RF-56) — nunca na abertura do app, quando ela ainda não sabe o que ganha.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const response = await requestPermissionsAsync();
  const permission = toPermission(response);

  if (permission === 'granted') {
    await ensureAndroidChannel();
  }

  return permission;
}

/** Cria o canal do Android. Idempotente: chamar de novo só atualiza. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Avisos da loja',
    description: 'Promoções e novidades dos produtos que você acompanha.',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/**
 * Apresenta uma mensagem da loja como notificação local.
 *
 * O payload é tratado por inteiro (RF-59): título e corpo vão para a pessoa,
 * e o `data` inteiro viaja junto para o app saber o que fazer no toque.
 */
export async function presentStoreMessage(message: PushMessage): Promise<void> {
  await scheduleNotificationAsync({
    content: {
      title: message.title ?? 'Novidade na loja',
      body: message.body ?? 'Toque para ver.',
      data: message.data ?? {},
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    // `null` dispara agora, sem agendamento.
    trigger: null,
  });
}

/**
 * Lê o id de produto de um payload de notificação.
 *
 * O backend manda `produtoId` (nome do enunciado), mas aceitar as variantes
 * mais prováveis custa três linhas e evita um deep link mudo caso o nome mude.
 */
export function readProductId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const candidate = record.produtoId ?? record.productId ?? record.produto_id;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
}

// ---------------------------------------------------------------------------
// Preferência e controle de duplicidade
// ---------------------------------------------------------------------------

/** Guarda a escolha da pessoa para o app não reaparecer pedindo a cada abertura. */
export async function setOptIn(value: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(OPT_IN_KEY, value ? '1' : '0');
  } catch {
    // Preferência é conveniência: se o storage falhar, o app segue funcionando.
  }
}

export async function getOptIn(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(OPT_IN_KEY)) === '1';
  } catch {
    return false;
  }
}

/**
 * Último aviso já mostrado. Sem isso, toda abertura do app repetiria o
 * histórico inteiro da loja em forma de notificação.
 */
export async function getLastSeenAt(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(LAST_SEEN_KEY);
  } catch {
    return null;
  }
}

export async function setLastSeenAt(isoDate: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(LAST_SEEN_KEY, isoDate);
  } catch {
    // Idem: falhar aqui só causa repetição, não quebra nada.
  }
}
