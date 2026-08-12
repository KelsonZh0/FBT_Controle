import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { listProducts } from '@/services/products';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, ProductSummary } from '@/types/api';
import { useProducts } from '@/hooks/useProducts';
import { useSession } from '@/session/session';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export function ProductsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({ search });
  const { isAuthenticated, customer, logout } = useSession();

  return (
    <View style={styles.container}>
      <View style={styles.accountBar}>
        {isAuthenticated ? (
          <>
            <Text style={styles.accountText}>Olá, {customer?.name}</Text>
            <Text style={styles.accountAction} onPress={logout}>
              Sair
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.accountText}>Você não está logado</Text>
            <Text style={styles.accountAction} onPress={() => navigation.navigate('Login')}>
              Entrar / Cadastrar
            </Text>
          </>
        )}
      </View>

      <View style={styles.header}>
        <TextInput
          style={styles.search}
          placeholder="Buscar produto…"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        <Button label="Carrinho" variant="ghost" onPress={() => navigation.navigate('Cart')} />
      </View>

      {isLoading ? (
        <Loading label="Buscando produtos…" />
      ) : isError ? (
        <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
                <Text style={styles.price}>
                  {item.priceFrom === item.priceTo
                    ? money(item.priceFrom)
                    : `${money(item.priceFrom)} – ${money(item.priceTo)}`}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  accountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.grayLight,
    paddingBottom: 8,
  },
  accountText: { fontSize: 13, color: colors.gray },
  accountAction: { fontSize: 13, fontWeight: '700', color: colors.primary },
  header: { flexDirection: 'row', gap: 8, padding: 12, alignItems: 'center' },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 10 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#f9fafb', borderRadius: 12, padding: 10 },
  thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#e5e7eb' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, justifyContent: 'center', gap: 2 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  brand: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 2 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
});
