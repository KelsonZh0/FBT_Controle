import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useSession } from '@/session/session';
import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation';

export function CartHeaderButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useSession();
  const { data: cart } = useCart();
  const count = isAuthenticated ? cart?.itemCount ?? 0 : 0;

  return (
    <Pressable onPress={() => navigation.navigate('Cart')} style={styles.button} hitSlop={10}>
      <Ionicons name="cart-outline" size={24} color={colors.white} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { marginRight: 12, padding: 4 },
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
