import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useValidateRecoveryEmail } from '@/hooks/useAuthMutations';
import { Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation, route }: Props) {
	const [email, setEmail] = useState(route.params?.email ?? '');
	const { mutate, isPending, isError, error } = useValidateRecoveryEmail();

	const canSubmit = email.trim().length > 0;

	const handleSubmit = () => {
		mutate(email.trim(), {
			onSuccess: (exists) => {
				if (!exists) return;
				navigation.navigate('ResetPassword', { email: email.trim() });
			},
		});
	};

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				<View style={styles.logoBadge}>
					<MaterialCommunityIcons name="remote-tv" size={24} color={colors.yellow} />
					<Text style={styles.logoText}>FBT</Text>
				</View>
				<Text style={styles.tagline}>A sua busca termina aqui!</Text>

				<Text style={styles.title}>Esqueci minha senha</Text>
				<Text style={styles.helper}>Informe seu e-mail para continuar.</Text>

				<View style={styles.inputRow}>
					<Ionicons name="mail-outline" size={18} color={colors.gray} style={styles.inputIcon} />
					<TextInput
						style={styles.inputField}
						placeholder="E-mail"
						placeholderTextColor={colors.gray}
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="email-address"
					/>
				</View>

				{isError && <Text style={styles.error}>{(error as ApiError).message}</Text>}

				<Button
					label={isPending ? 'Validando…' : 'Continuar'}
					onPress={handleSubmit}
					disabled={isPending || !canSubmit}
				/>

				<Text style={styles.link} onPress={() => navigation.goBack()}>
					Voltar para o login
				</Text>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: colors.white },
	container: { flex: 1, padding: 24, justifyContent: 'center' },
	logoBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		alignSelf: 'center',
		backgroundColor: colors.primary,
		borderRadius: 100,
		paddingHorizontal: 32,
		paddingVertical: 14,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	logoText: { color: colors.yellow, fontSize: 32, fontWeight: '900', letterSpacing: 2 },
	tagline: { textAlign: 'center', color: colors.primary, fontWeight: '600', marginBottom: 32 },
	title: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 8 },
	helper: { color: colors.gray, marginBottom: 16 },
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 50,
		backgroundColor: '#F5F7FA',
		borderRadius: 10,
		paddingHorizontal: 14,
		marginBottom: 12,
	},
	inputIcon: { marginRight: 8 },
	inputField: { flex: 1, fontSize: 15, color: colors.black },
	error: { color: colors.danger, marginBottom: 8, fontSize: 13 },
	link: { textAlign: 'center', color: colors.primary, marginTop: 20, fontWeight: '600' },
});
