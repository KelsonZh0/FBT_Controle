import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavorites } from '@/context/favorites';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation';

export function FavoritesHeaderButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favoriteCount } = useFavorites();

  return (
    <Pressable
      onPress={() => navigation.navigate('Favorites')}
      style={styles.button}
      hitSlop={10}
      accessibilityLabel="Ver favoritos"
    >
      <Ionicons
        name={favoriteCount > 0 ? 'heart' : 'heart-outline'}
        size={23}
        color={favoriteCount > 0 ? '#ff6b81' : colors.white}
      />
      {favoriteCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{favoriteCount > 9 ? '9+' : favoriteCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { marginRight: 8, padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});
