import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Linking } from 'react-native';
// Imports profundos pelo mesmo motivo explicado em `notifications.ts`: o
// índice do expo-notifications quebra no Expo Go em Android.
import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from 'expo-notifications/build/NotificationsEmitter';
import type { NotificationResponse } from 'expo-notifications/build/Notifications.types';
import { listPushMessages } from '@/services/push';
import { navigationRef } from '@/navigation';
import {
  getLastSeenAt,
  getNotificationPermission,
  getOptIn,
  presentStoreMessage,
  readProductId,
  requestNotificationPermission,
  setLastSeenAt,
  setOptIn,
  type NotificationPermission,
} from './notifications';

interface NotificationsContextValue {
  permission: NotificationPermission;
  /** A pessoa já pediu para receber avisos da loja neste aparelho. */
  optIn: boolean;
  /** Pede a permissão e liga os avisos. Chamado por um toque explícito (RF-56). */
  enable: () => Promise<void>;
  /** Desliga sem mexer na permissão do sistema. */
  disable: () => Promise<void>;
  openSettings: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

/** Quanto esperar entre tentativas de navegar na abertura a frio. */
const NAVIGATION_RETRY_MS = 250;
const MAX_NAVIGATION_ATTEMPTS = 20;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('unknown');
  const [optIn, setOptInState] = useState(false);

  useEffect(() => {
    (async () => {
      setPermission(await getNotificationPermission());
      setOptInState(await getOptIn());
    })();
  }, []);

  /**
   * Navega para o produto, esperando a navegação existir se preciso.
   *
   * Na abertura a frio, o toque é lido antes de a pilha de navegação montar.
   * Por isso a tentativa se repete por alguns segundos em vez de desistir na
   * primeira — e desiste de vez depois disso, para não ficar um timer vivo à toa.
   */
  const navigateToProduct = useCallback((productId: string) => {
    function tryNavigate(): boolean {
      if (!navigationRef.isReady()) return false;
      navigationRef.navigate('ProductDetail', { id: productId });
      return true;
    }

    if (tryNavigate()) return;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (tryNavigate() || attempts >= MAX_NAVIGATION_ATTEMPTS) {
        clearInterval(timer);
      }
    }, NAVIGATION_RETRY_MS);
  }, []);

  // Deep link (RF-59): o toque abre a tela do produto que veio no `data`.
  useEffect(() => {
    function handleResponse(response: NotificationResponse | null) {
      if (!response) return;
      const productId = readProductId(response.notification.request.content.data);
      if (productId) navigateToProduct(productId);
    }

    const subscription = addNotificationResponseReceivedListener(handleResponse);

    // Com o app FECHADO, o toque não dispara o listener: a resposta fica
    // guardada e só é lida aqui, na primeira montagem.
    getLastNotificationResponseAsync().then(handleResponse);

    return () => subscription.remove();
  }, [navigateToProduct]);

  /**
   * Lê o histórico da loja e apresenta o que ainda não foi mostrado (RF-58,
   * Caminho B). Roda ao abrir o app e ao voltar do segundo plano.
   */
  const consumeStoreMessages = useCallback(async () => {
    if (!optIn || permission !== 'granted') return;

    try {
      const page = await listPushMessages({ pageSize: 20 });
      if (!page.data.length) return;

      const lastSeen = await getLastSeenAt();
      const fresh = page.data.filter((message) => !lastSeen || message.createdAt > lastSeen);

      // Do mais antigo para o mais novo, para a ordem na gaveta fazer sentido.
      for (const message of [...fresh].reverse()) {
        await presentStoreMessage(message);
      }

      await setLastSeenAt(page.data[0].createdAt);
    } catch {
      // Falhar em buscar avisos não pode atrapalhar o uso do app.
    }
  }, [optIn, permission]);

  useEffect(() => {
    consumeStoreMessages();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') consumeStoreMessages();
    });

    return () => subscription.remove();
  }, [consumeStoreMessages]);

  const enable = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result !== 'granted') return;

    // O canal já é criado dentro de `requestNotificationPermission`, e falhar
    // ali não impede nada: as notificações continuam chegando pelo canal padrão.
    await setOptIn(true);
    setOptInState(true);
  }, []);

  const disable = useCallback(async () => {
    await setOptIn(false);
    setOptInState(false);
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ permission, optIn, enable, disable, openSettings }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications precisa estar dentro de NotificationsProvider');
  }
  return context;
}
