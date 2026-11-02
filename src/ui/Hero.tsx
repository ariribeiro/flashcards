import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { maxContentWidth, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Faixa de topo com degradê do tema (ou a cor passada, ex.: a cor do baralho). */
export function Hero({ children, color, safeTop = true }: { children: ReactNode; color?: string; safeTop?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const from = color ?? colors.heroFrom;
  const to = color ? shade(color, -0.25) : colors.heroTo;
  return (
    <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: (safeTop ? insets.top : 0) + space.xl }]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

/** Escurece (amount < 0) ou clareia uma cor hex. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingBottom: space.xxl, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  inner: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: space.lg },
});
