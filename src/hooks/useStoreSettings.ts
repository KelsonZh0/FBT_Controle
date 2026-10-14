import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '@/services/store';

/**
 * Configuração da loja. Praticamente nunca muda durante o uso do app, então
 * fica fresca por bastante tempo em vez de ser buscada a cada tela.
 */
export function useStoreSettings() {
  return useQuery({
    queryKey: ['store', 'settings'] as const,
    queryFn: getStoreSettings,
    staleTime: 1000 * 60 * 30,
  });
}
