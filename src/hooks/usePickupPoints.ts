import { useQuery } from '@tanstack/react-query';
import { listPickupPoints, type ListPickupPointsParams } from '@/services/pickupPoints';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Pontos de retirada. Os parâmetros entram na chave do cache de propósito: com
 * e sem coordenadas são respostas diferentes (uma ordenada por distância, outra
 * na ordem de cadastro), e misturar as duas no mesmo cache mostraria distância
 * velha depois que a permissão fosse negada.
 */
export function usePickupPoints(params: ListPickupPointsParams = {}) {
  return useQuery({
    queryKey: queryKeys.pickupPoints.list(params),
    queryFn: () => listPickupPoints(params),
  });
}
