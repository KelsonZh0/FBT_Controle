import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCategories } from '@/hooks/useCategories';
import { ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList, TabParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Categorias'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function CategoriasScreen({ navigation }: Props) {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();

  if (isLoading) return <Loading label="Carregando categorias…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = categories ?? [];

  return (
    <FlatList
      data={items}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>Nenhuma categoria cadastrada ainda.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => navigation.navigate('Home', { categoryId: item.id })}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 14,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.black },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 40 },
});
