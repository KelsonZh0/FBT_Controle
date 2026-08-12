import { useCart } from '@/hooks/useCart';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useSession } from '@/session/session';
import { Button } from '@/components/ui';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { isAuthenticated, customer, logout } = useSession();
  const { data: cart, isLoading, isError, error, refetch } = useCart({ enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Entre para ver seu carrinho</Text>
        <Text style={styles.body}>
          Você precisa estar logado para adicionar itens e finalizar a compra.
        </Text>
        <View style={styles.actions}>
          <Button label="Entrar" onPress={() => navigation.navigate('Login')} />
          <Button label="Criar conta" variant="ghost" onPress={() => navigation.navigate('Cadastro')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🛒</Text>
      <Text style={styles.title}>Olá, {customer?.name} — carrinho a construir na Semana 2</Text>
      <Text style={styles.body}>
        Bloco 3 de quarta: useCart e mutations otimistas.
        Siga o exercicios.md §2 e compare com o app do professor.
      </Text>
      <Button label="Sair da conta" variant="ghost" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10, backgroundColor: colors.white },
  emoji: { fontSize: 48 },
  title: { fontSize: 17, fontWeight: '700', color: colors.black, textAlign: 'center' },
  body: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
});
