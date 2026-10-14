import { http } from './http';
import type { Paginated } from '@/types/api';

/**
 * Um registro do histórico de envios da loja (o "inspector" do backend).
 *
 * Os campos vêm do que o servidor tentou enviar, então `title`, `body` e `data`
 * são o payload bruto. Tudo é opcional porque uma tentativa que não chegou a
 * sair (sem aparelho registrado, por exemplo) grava menos informação.
 */
export interface PushMessage {
  id: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  kind: 'NOTIFICATION' | 'DATA';
  title: string | null;
  body: string | null;
  /** O payload do app. É daqui que sai o `produtoId` do deep link. */
  data: Record<string, unknown> | null;
  /** Por que o envio foi feito (ex.: `test`, `price-drop`). */
  reason: string | null;
  /**
   * `NO_DEVICE` não é falha de código: é o servidor dizendo que funcionou e
   * não havia aparelho registrado para receber.
   */
  errorCode: string | null;
  errorDetail: string | null;
  fcmMessageId: string | null;
  customerId: string | null;
  device: { id: string; platform: string } | null;
  createdAt: string;
}

export interface ListPushMessagesParams {
  status?: 'SENT' | 'FAILED' | 'SKIPPED';
  page?: number;
  pageSize?: number;
}

/**
 * Histórico de envios da loja. É daqui que o Caminho B tira o que apresentar:
 * o app lê o que a loja mandou e desenha como notificação local.
 */
export async function listPushMessages(
  params: ListPushMessagesParams = {},
): Promise<Paginated<PushMessage>> {
  const { data } = await http.get<Paginated<PushMessage>>('/push/messages', { params });
  return data;
}
