import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Bloco com fundo e borda de 1px. Com onPress, vira uma linha tocável. */
export function Surface({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: ViewStyle }) {
  const { colors } = useTheme();
  const s = [styles.base, { backgroundColor: colors.surface, borderColor: colors.border }, style];
  if (!onPress) return <View style={s}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s, { opacity: pressed ? 0.7 : 1 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, borderRadius: radius, padding: space.lg },
});
