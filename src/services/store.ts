import { http } from './http';

/**
 * Configuração pública da loja. Só os campos que o app usa — a resposta traz
 * bem mais (fiscal, tema, contato) e nada disso interessa aqui.
 *
 * A latitude e a longitude são a sede da loja, que o mapa de retirada mostra
 * junto com os pontos (RF-46). Elas não vêm na resposta de `/pickup-points`:
 * lá o `origin` é de onde as distâncias foram medidas, que é a posição do
 * usuário, não a da loja.
 */
export interface StoreSettings {
  storeName: string | null;
  storeDescription: string | null;
  logoUrl: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data } = await http.get<StoreSettings>('/store/settings');
  return data;
}
