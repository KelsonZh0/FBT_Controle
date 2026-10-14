import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

const TOTAL = 5;

/** Estrelas só de leitura, a partir de uma média (aceita meia estrela). */
export function StarsDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`${value.toFixed(1)} de ${TOTAL} estrelas`}>
      {Array.from({ length: TOTAL }, (_, i) => {
        const position = i + 1;
        const name =
          value >= position ? 'star' : value >= position - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={position} name={name} size={size} color={colors.yellow} />;
      })}
    </View>
  );
}

/** Estrelas tocáveis, para a nota do formulário (RF-38). */
export function StarsInput({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: TOTAL }, (_, i) => {
        const position = i + 1;
        return (
          <Pressable
            key={position}
            onPress={() => onChange(position)}
            hitSlop={6}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === position }}
            accessibilityLabel={`${position} ${position === 1 ? 'estrela' : 'estrelas'}`}
          >
            <Ionicons
              name={value >= position ? 'star' : 'star-outline'}
              size={size}
              color={value >= position ? colors.yellow : colors.border}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
