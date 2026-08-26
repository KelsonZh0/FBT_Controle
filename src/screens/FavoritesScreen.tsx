import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFavorites } from '@/context/favorites';
import { useQuickAddToCart } from '@/hooks/useQuickAddToCart';
import { money } from '@/lib/format';
import { Button, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ProductSummary } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const quickAdd = useQuickAddToCart();

  function handleAdd(item: ProductSummary) {
    if (item.type === 'VARIABLE') {
      navigation.navigate('ProductDetail', { id: item.id, name: item.name });
      return;
    }
    quickAdd.mutate(item);
  }

  if (isLoading) {
    return <Loading label="Carregando favoritos…" />;
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="heart-outline" size={54} color={colors.gray} />
        </View>
        <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
        <Text style={styles.emptySub}>
          Toque no ícone de coração nos produtos para salvá-los aqui e encontrá-los facilmente.
        </Text>
        <View style={{ marginTop: 8 }}>
          <Button
            label="Explorar produtos"
            onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.countText}>
              {favorites.length} {favorites.length === 1 ? 'produto salvo' : 'produtos salvos'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}
          >
            <View>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]} />
              )}

              {item.brand && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.brand}</Text>
                </View>
              )}

              {/* Botão de Desfavoritar no card */}
              <Pressable
                style={styles.favBadge}
                hitSlop={8}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item);
                }}
              >
                <Ionicons name="heart" size={18} color={colors.danger} />
              </Pressable>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>
                {item.priceFrom === item.priceTo
                  ? money(item.priceFrom)
                  : `${money(item.priceFrom)} – ${money(item.priceTo)}`}
              </Text>
            </View>

            <Pressable
              style={styles.addButton}
              disabled={quickAdd.isPending}
              onPress={(e) => {
                e.stopPropagation();
                handleAdd(item);
              }}
            >
              <Text style={styles.addButtonText}>
                {quickAdd.isPending ? 'Adicionando…' : 'Adicionar'}
              </Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: colors.white,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.black, textAlign: 'center' },
  emptySub: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 12 },
  listHeader: { paddingVertical: 12 },
  countText: { fontSize: 13, fontWeight: '600', color: colors.gray },
  row: { justifyContent: 'space-between', marginBottom: 4 },
  card: {
    width: '48%',
    flexDirection: 'column',
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: { width: '100%', height: 130, borderRadius: 8, backgroundColor: colors.border },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  tag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: colors.black },
  favBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.white,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  cardBody: { justifyContent: 'center', gap: 2, marginTop: 8 },
  name: { fontSize: 13, fontWeight: '600', color: colors.black, minHeight: 34 },
  price: { fontSize: 15, fontWeight: '700', color: colors.black, marginTop: 2, marginBottom: 8 },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
