import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { money } from '@/lib/format';
import { ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList, TabParamList } from '@/navigation';
import type { ApiError, ProductSummary } from '@/types/api';
import { useProducts } from '@/hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import { useQuickAddToCart } from '@/hooks/useQuickAddToCart';
import { colors } from '@/theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProductsScreen({ navigation, route }: Props) {
  const [search, setSearch] = useState('');
  const [brandId, setBrandId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(route.params?.categoryId);

  useEffect(() => {
    if (route.params?.categoryId) setCategoryId(route.params.categoryId);
  }, [route.params?.categoryId]);

  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({ search, brandId, categoryId });
  const { data: brands } = useBrands();
  const quickAdd = useQuickAddToCart();

  function handleAdd(item: ProductSummary) {
    if (item.type === 'VARIABLE') {
      navigation.navigate('ProductDetail', { id: item.id, name: item.name });
      return;
    }
    quickAdd.mutate(item);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Pesquisar controles remotos…"
            placeholderTextColor={colors.gray}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
      </View>

      {!!brands?.length && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <Text
            style={[styles.chip, !brandId && styles.chipActive]}
            onPress={() => setBrandId(undefined)}
          >
            Todas
          </Text>
          {brands.map((b) => (
            <Text
              key={b.id}
              style={[styles.chip, brandId === b.id && styles.chipActive]}
              onPress={() => setBrandId(b.id === brandId ? undefined : b.id)}
            >
              {b.name}
            </Text>
          ))}
        </ScrollView>
      )}

      {isLoading ? (
        <Loading label="Buscando produtos…" />
      ) : isError ? (
        <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
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
                onPress={() => handleAdd(item)}
              >
                <Text style={styles.addButtonText}>
                  {quickAdd.isPending ? 'Adicionando…' : 'Adicionar'}
                </Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', gap: 8, padding: 12, alignItems: 'center' },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayLight,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 6 },
  search: { flex: 1, paddingVertical: 10, color: colors.black },
  chipsRow: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    color: colors.black,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accent, color: colors.white },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 12 },
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
  cardBody: { justifyContent: 'center', gap: 2, marginTop: 8 },
  name: { fontSize: 13, fontWeight: '600', color: colors.black, minHeight: 34 },
  price: { fontSize: 15, fontWeight: '700', color: colors.black, marginTop: 2, marginBottom: 8 },
  addButton: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 8, alignItems: 'center' },
  addButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 40 },
});
