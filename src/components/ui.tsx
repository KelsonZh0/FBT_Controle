import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { pressScale, springs, useMotionEnabled } from '@/theme/motion';

export function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <Center>
      <ActivityIndicator size="large" />
      <Text style={styles.muted}>{label}</Text>
    </Center>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Center>
      <Text style={styles.errorTitle}>Algo deu errado</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry && (
        <Button label="Tentar de novo" onPress={onRetry} />
      )}
    </Center>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  // RF-49: o controle responde ao toque com mola.
  // RF-54: quando o movimento está desligado (constante do app ou "Reduzir
  // movimento" do sistema), a mola é substituída pelo esmaecimento — o toque
  // continua tendo resposta visível, só deixa de ter deslocamento.
  const motionEnabled = useMotionEnabled();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    if (!motionEnabled) return;
    scale.value = withSpring(pressScale, springs.press);
  }

  function handlePressOut() {
    if (!motionEnabled) return;
    scale.value = withSpring(1, springs.press);
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          variant === 'ghost' && styles.btnGhost,
          (disabled || (pressed && !motionEnabled)) && styles.btnDim,
        ]}
      >
        <Text style={[styles.btnText, variant === 'ghost' && styles.btnTextGhost]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  muted: { color: colors.gray, textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#b91c1c' },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent },
  btnDim: { opacity: 0.55 },
  btnText: { color: colors.white, fontWeight: '700' },
  btnTextGhost: { color: colors.accent },
});
