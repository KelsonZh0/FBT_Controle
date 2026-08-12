import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useLogin } from '@/hooks/useAuthMutations';
import { Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, isError, error } = useLogin();

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = () => {
    mutate(
      { email: email.trim(), password },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>FBT</Text>
        </View>
        <Text style={styles.tagline}>A sua busca termina aqui!</Text>

        <Text style={styles.title}>Entrar</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.gray}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={colors.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isError && <Text style={styles.error}>{(error as ApiError).message}</Text>}

        <Button
          label={isPending ? 'Entrando…' : 'Entrar'}
          onPress={handleSubmit}
          disabled={isPending || !canSubmit}
        />

        <Text style={styles.link} onPress={() => navigation.navigate('Cadastro')}>
          Não tem conta? Cadastre-se
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logoBadge: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderWidth: 6,
    borderColor: colors.accent,
    borderRadius: 100,
    paddingHorizontal: 36,
    paddingVertical: 14,
    marginBottom: 10,
  },
  logoText: { color: colors.yellow, fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  tagline: { textAlign: 'center', color: colors.primary, fontWeight: '600', marginBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: colors.black,
  },
  error: { color: colors.danger, marginBottom: 8, fontSize: 13 },
  link: { textAlign: 'center', color: colors.primary, marginTop: 20, fontWeight: '600' },
});
