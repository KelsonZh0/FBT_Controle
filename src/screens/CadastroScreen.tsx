import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useRegister } from '@/hooks/useAuthMutations';
import { Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export function CadastroScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState('');
  const { mutate, isPending, isError, error } = useRegister();

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const handleSubmit = () => {
    mutate(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        document: document.trim() || undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>FBT</Text>
        </View>
        <Text style={styles.tagline}>A sua busca termina aqui!</Text>

        <Text style={styles.title}>Criar conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.gray}
          value={name}
          onChangeText={setName}
        />
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
          placeholder="Senha (mín. 6 caracteres)"
          placeholderTextColor={colors.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="CPF/CNPJ (opcional)"
          placeholderTextColor={colors.gray}
          value={document}
          onChangeText={setDocument}
        />

        {isError && <Text style={styles.error}>{(error as ApiError).message}</Text>}

        <Button
          label={isPending ? 'Criando conta…' : 'Criar conta'}
          onPress={handleSubmit}
          disabled={isPending || !canSubmit}
        />

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Já tem conta? Entrar
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
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
