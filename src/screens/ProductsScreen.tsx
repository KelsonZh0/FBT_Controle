import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

const PAGE_SIZE = 6;

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProductsScreen({ navigation, route }: Props) {
  const [search, setSearch] = useState('');
  const [brandId, setBrandId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(route.params?.categoryId);
  const [page, setPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (route.params?.categoryId) {
      setCategoryId(route.params.categoryId);
      setPage(1);
    }
  }, [route.params?.categoryId]);

  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({
    search: search.trim() || undefined,
    brandId,
    categoryId,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: brands } = useBrands();
  const quickAdd = useQuickAddToCart();

  const products: ProductSummary[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? (data as unknown as ProductSummary[])
      : [];

  const total = data?.total ?? products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleAdd(item: ProductSummary) {
    if (item.type === 'VARIABLE') {
      navigation.navigate('ProductDetail', { id: item.id, name: item.name });
      return;
    }
    quickAdd.mutate(item);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.gray}
              onPress={() => {
                setSearch('');
                setPage(1);
              }}
            />
          )}
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
            onPress={() => {
              setBrandId(undefined);
              setPage(1);
            }}
          >
            Todas
          </Text>
          {brands.map((b) => (
            <Text
              key={b.id}
              style={[styles.chip, brandId === b.id && styles.chipActive]}
              onPress={() => {
                setBrandId(b.id === brandId ? undefined : b.id);
                setPage(1);
              }}
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
          ref={flatListRef}
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
          ListFooterComponent={
            products.length > 0 && totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                  disabled={page <= 1 || isFetching}
                  onPress={() => handlePageChange(page - 1)}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={page <= 1 ? colors.gray : colors.primary}
                  />
                  <Text style={[styles.pageBtnText, page <= 1 && styles.pageBtnTextDisabled]}>
                    Anterior
                  </Text>
                </Pressable>

                <View style={styles.pageInfo}>
                  <View style={styles.pageInfoRow}>
                    <Text style={styles.pageText}>
                      Página <Text style={styles.pageCurrent}>{page}</Text> de {totalPages}
                    </Text>
                    {isFetching && !isLoading && (
                      <ActivityIndicator size="small" color={colors.accent} style={styles.pageSpinner} />
                    )}
                  </View>
                  <Text style={styles.pageSubText}>
                    {total} produtos no total
                  </Text>
                </View>

                <Pressable
                  style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                  disabled={page >= totalPages || isFetching}
                  onPress={() => handlePageChange(page + 1)}
                >
                  <Text style={[styles.pageBtnText, page >= totalPages && styles.pageBtnTextDisabled]}>
                    Próxima
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={page >= totalPages ? colors.gray : colors.primary}
                  />
                </Pressable>
              </View>
            ) : null
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
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.grayLight,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageBtnDisabled: {
    opacity: 0.4,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  pageBtnTextDisabled: {
    color: colors.gray,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  pageCurrent: {
    color: colors.accent,
    fontWeight: '800',
  },
  pageSubText: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  pageSpinner: {
    marginLeft: 2,
  },
});
