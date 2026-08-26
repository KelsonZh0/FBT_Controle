import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { ProductSummary } from '@/types/api';

const FAVORITES_KEY = 'fbt_favorite_products';

export async function getSavedFavorites(customerId?: string | null): Promise<ProductSummary[]> {
  const key = customerId ? `${FAVORITES_KEY}_${customerId}` : FAVORITES_KEY;

  if (Platform.OS === 'web') {
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as ProductSummary[]) : [];
    } catch {
      return [];
    }
  }

  try {
    const data = await SecureStore.getItemAsync(key);
    return data ? (JSON.parse(data) as ProductSummary[]) : [];
  } catch (e) {
    console.warn('[favoritesStorage] Erro ao recuperar favoritos do SecureStore:', e);
    return [];
  }
}

export async function saveFavorites(
  favorites: ProductSummary[],
  customerId?: string | null,
): Promise<void> {
  const key = customerId ? `${FAVORITES_KEY}_${customerId}` : FAVORITES_KEY;
  const json = JSON.stringify(favorites);

  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, json);
    } catch (e) {
      console.warn('[favoritesStorage] Erro ao salvar favoritos no localStorage:', e);
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, json);
  } catch (e) {
    console.warn('[favoritesStorage] Erro ao salvar favoritos no SecureStore:', e);
  }
}
