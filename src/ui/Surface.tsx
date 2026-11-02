import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function Surface({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: ViewStyle | ViewStyle[] }) {
  const { colors } = useTheme();
  const s = [
    styles.base,
    { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
    style,
  ];
  if (!onPress) return <View style={s}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s, { transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius,
    padding: space.lg,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
});
