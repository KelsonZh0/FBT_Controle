import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProductSummary } from '@/types/api';
import { getSavedFavorites, saveFavorites } from '@/lib/favoritesStorage';
import { useSession } from '@/session/session';

interface FavoritesContextValue {
  favorites: ProductSummary[];
  favoriteCount: number;
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: ProductSummary) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { customer } = useSession();
  const [favorites, setFavorites] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega os favoritos salvos no storage do usuário atual
  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      setIsLoading(true);
      try {
        const stored = await getSavedFavorites(customer?.id);
        if (isMounted) {
          setFavorites(stored);
        }
      } catch (err) {
        console.error('[FavoritesProvider] Erro ao carregar favoritos:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [customer?.id]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((item) => item.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (product: ProductSummary) => {
      setFavorites((prev) => {
        const exists = prev.some((item) => item.id === product.id);
        const updated = exists
          ? prev.filter((item) => item.id !== product.id)
          : [...prev, product];

        // Salva de forma assíncrona no hardware
        saveFavorites(updated, customer?.id).catch((err) => {
          console.error('[FavoritesProvider] Erro ao salvar favoritos:', err);
        });

        return updated;
      });
    },
    [customer?.id],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteCount: favorites.length,
      isLoading,
      isFavorite,
      toggleFavorite,
    }),
    [favorites, isLoading, isFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites precisa ser usado dentro de <FavoritesProvider>.');
  }
  return ctx;
}
