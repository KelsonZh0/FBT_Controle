import { http } from './http';
import type { PickupPointsResponse } from '@/types/api';

export interface ListPickupPointsParams {
  latitude?: number;
  longitude?: number;
  maxKm?: number;
}

/**
 * Pontos de retirada ativos da loja.
 *
 * Com latitude e longitude, a API ordena por distância e preenche `distanceKm`
 * em cada ponto (RF-44). Sem elas, a lista vem na ordem de cadastro, sem
 * distância e com `origin: null` — isso é o comportamento esperado quando o
 * usuário negou a localização, não um erro (RF-45).
 */
export async function listPickupPoints(params: ListPickupPointsParams = {}): Promise<PickupPointsResponse> {
  const { data } = await http.get<PickupPointsResponse>('/pickup-points', { params });
  return data;
}
