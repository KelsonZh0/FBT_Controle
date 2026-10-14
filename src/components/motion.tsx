import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { durations, springs, stagger, useMotionEnabled } from '@/theme/motion';

/**
 * Peças de movimento reutilizáveis.
 *
 * Toda animação do app mora aqui ou em `theme/motion.ts` — as telas só compõem.
 * Isso atende o RF-62 (movimento é identidade, e vem de um lugar só) e evita o
 * desconto por "lógica de animação espalhada pelos componentes".
 *
 * Regra que vale para todos os componentes deste arquivo: quando
 * `useMotionEnabled()` devolve `false`, o movimento é SUBSTITUÍDO por um
 * estado estático equivalente — nunca simplesmente removido (RF-54).
 */

/**
 * Item de lista animado (RF-51 e RF-52).
 *
 * Entra escalonado pelo índice, com teto no atraso para o último item de uma
 * página não esperar o escalonamento inteiro. Ao ser removido, sai animado e os
 * vizinhos se acomodam sozinhos pelo `layout`.
 */
export function AnimatedListItem({
  index,
  children,
  style,
}: {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const motionEnabled = useMotionEnabled();

  // Sem movimento, o item aparece direto no lugar certo: a lista continua
  // legível e completa, só não tem entrada nem saída animadas.
  if (!motionEnabled) {
    return <View style={style}>{children}</View>;
  }

  const delay = Math.min(index * stagger.step, stagger.max);

  return (
    <Animated.View
      style={style}
      entering={FadeInDown.springify()
        .damping(springs.entrance.damping)
        .stiffness(springs.entrance.stiffness)
        .delay(delay)}
      exiting={FadeOut.duration(durations.fast)}
      layout={LinearTransition.springify()
        .damping(springs.layout.damping)
        .stiffness(springs.layout.stiffness)}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Coração de favoritar (RF-50).
 *
 * Favoritar não navega para lugar nenhum, então o toque precisa de uma
 * confirmação visível: o coração dá um salto e volta. Com o movimento
 * desligado, a confirmação continua existindo pela troca de ícone (contorno →
 * preenchido) e de cor — o que muda é só o salto.
 */
export function FavoriteHeart({
  active,
  onPress,
  size = 18,
  style,
}: {
  active: boolean;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const motionEnabled = useMotionEnabled();
  const pop = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  function handlePress() {
    if (motionEnabled) {
      pop.value = withSequence(withSpring(1.35, springs.press), withSpring(1, springs.press));
    }
    onPress();
  }

  return (
    <Pressable style={style} hitSlop={8} onPress={handlePress} accessibilityRole="button">
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={size}
          color={active ? colors.danger : colors.gray}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * Três pontos pulsando, para o estado de carregamento ter sinal de vida em vez
 * de um texto parado (RF-53). Com o movimento desligado, os pontos ficam
 * visíveis e estáticos — o indicador nativo ao lado continua girando, então o
 * usuário ainda sabe que algo está acontecendo.
 */
export function PulsingDots({ color = colors.gray }: { color?: string }) {
  const motionEnabled = useMotionEnabled();

  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => (
        <PulsingDot key={i} index={i} color={color} enabled={motionEnabled} />
      ))}
    </View>
  );
}

function PulsingDot({ index, color, enabled }: { index: number; color: string; enabled: boolean }) {
  const progress = useSharedValue(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      index * 140,
      withRepeat(withTiming(1, { duration: durations.slow }), -1, true),
    );
  }, [enabled, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + progress.value * 0.7,
    transform: [{ scale: 0.8 + progress.value * 0.2 }],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
