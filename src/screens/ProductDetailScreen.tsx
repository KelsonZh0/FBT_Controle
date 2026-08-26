import { useLayoutEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProduct } from '@/hooks/useProduct';
import { useCartMutations } from '@/hooks/useCartMutations';
import { useSession } from '@/session/session';
import { useFavorites } from '@/context/favorites';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, ProductSummary, ProductVariant } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const { isAuthenticated } = useSession();
  const { addItem } = useCartMutations();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [variantId, setVariantId] = useState<string | null>(null);

  const selected: ProductVariant | undefined = useMemo(() => {
    if (!product) return undefined;
    return (
      product.variants.find((v) => v.id === variantId) ??
      product.variants.find((v) => v.isDefault) ??
      product.variants[0]
    );
  }, [product, variantId]);

  const productSummary: ProductSummary | undefined = useMemo(() => {
    if (!product) return undefined;
    const prices = product.variants.map((v) => v.price).filter((p) => typeof p === 'number');
    const priceFrom = prices.length ? Math.min(...prices) : 0;
    const priceTo = prices.length ? Math.max(...prices) : 0;
    const stock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    const primaryImg = product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url ?? null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      type: product.type,
      state: product.state,
      brand: product.brand?.name ?? null,
      categoryId: product.category?.id ?? null,
      priceFrom,
      priceTo,
      stock,
      image: primaryImg,
      variantsCount: product.variants.length,
    };
  }, [product]);

  useLayoutEffect(() => {
    if (!productSummary) return;
    const favorited = isFavorite(productSummary.id);

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => toggleFavorite(productSummary)}
          hitSlop={10}
          style={{ marginRight: 8, padding: 4 }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? '#ff6b81' : colors.white}
          />
        </Pressable>
      ),
    });
  }, [navigation, productSummary, isFavorite, toggleFavorite]);

  if (isLoading) return <Loading label="Carregando produto…" />;
  if (isError || !product) {
    return <ErrorState message={(error as ApiError)?.message ?? 'Falha'} onRetry={() => refetch()} />;
  }

  const outOfStock = !selected || selected.stock <= 0;

  function handleAdd() {
    if (!product || !selected) return;
    addItem.mutate(
      {
        variantId: selected.id,
        quantity: 1,
        name: selected.label ? `${product.name} (${selected.label})` : product.name,
        unitPrice: selected.price,
      },
      { onSuccess: () => navigation.navigate('Cart') },
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {product.images[0] && <Image source={{ uri: product.images[0].url }} style={styles.hero} />}
        {productSummary && (
          <Pressable
            style={styles.heroFavBadge}
            hitSlop={8}
            onPress={() => toggleFavorite(productSummary)}
          >
            <Ionicons
              name={isFavorite(productSummary.id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite(productSummary.id) ? colors.danger : colors.gray}
            />
          </Pressable>
        )}
      </View>
      <Text style={styles.name}>{product.name}</Text>
      {selected && <Text style={styles.price}>{money(selected.price)}</Text>}
      {product.description && <Text style={styles.desc}>{product.description}</Text>}

      {/* Produto VARIABLE: deixa escolher a variante. SIMPLE já usa a única. */}
      {product.type === 'VARIABLE' && (
        <View style={styles.variants}>
          <Text style={styles.label}>Opções</Text>
          <View style={styles.variantRow}>
            {product.variants.map((v) => {
              const active = v.id === selected?.id;
              return (
                <Text
                  key={v.id}
                  onPress={() => setVariantId(v.id)}
                  style={[styles.chip, active && styles.chipActive, v.stock <= 0 && styles.chipDisabled]}
                >
                  {v.label ?? v.sku}
                </Text>
              );
            })}
          </View>
        </View>
      )}

      <Text style={styles.stock}>{outOfStock ? 'Sem estoque' : `${selected?.stock} em estoque`}</Text>

      {!isAuthenticated && (
        <Text style={styles.loginHint}>Você precisa estar logado para comprar (veja a tela do carrinho).</Text>
      )}

      <Button
        label={addItem.isPending ? 'Adicionando…' : 'Adicionar ao carrinho'}
        onPress={handleAdd}
        disabled={outOfStock || !isAuthenticated || addItem.isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  hero: { width: '100%', height: 260, borderRadius: 14, backgroundColor: '#e5e7eb' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  price: { fontSize: 20, fontWeight: '800', color: '#111827' },
  desc: { fontSize: 14, color: '#374151', lineHeight: 20 },
  variants: { gap: 6, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
    color: '#111827',
  },
  chipActive: { borderColor: '#111827', backgroundColor: '#111827', color: '#fff' },
  chipDisabled: { opacity: 0.4 },
  stock: { fontSize: 13, color: '#6b7280' },
  loginHint: { fontSize: 13, color: '#b45309' },
  heroFavBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
