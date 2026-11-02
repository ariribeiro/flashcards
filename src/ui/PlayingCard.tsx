import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** Moldura de carta de baralho com o ornamento do tema (naipes, pautas ou cantos simples). */
export function PlayingCard({
  children,
  style,
  corner,
  compact,
}: {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Conteúdo dos cantos no tema Vibrante (ex.: ícone do baralho) */
  corner?: ReactNode;
  compact?: boolean;
}) {
  const { colors, theme } = useTheme();
  const pad = compact ? 14 : 28;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow, padding: pad },
        style,
      ]}>
      {theme.cardStyle === 'ruled' ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 14 }).map((_, i) => (
            <View key={i} style={[styles.rule, { top: 44 + i * 30, backgroundColor: colors.ornament + '55' }]} />
          ))}
          <View style={[styles.margin, { backgroundColor: '#E57373aa' }]} />
        </View>
      ) : null}

      {theme.cardStyle === 'suits' ? (
        <>
          <Corner pos="tl"><Suit s="♠" color="#1B1B1B" small={compact} /></Corner>
          <Corner pos="br"><Suit s="♥" color={colors.ornament} small={compact} /></Corner>
        </>
      ) : theme.cardStyle === 'plain' && corner ? (
        <>
          <Corner pos="tl">{corner}</Corner>
          <Corner pos="br">{corner}</Corner>
        </>
      ) : null}

      {children}
    </View>
  );
}

function Suit({ s, color, small }: { s: string; color: string; small?: boolean }) {
  return <Text style={{ fontSize: small ? 16 : 26, color, lineHeight: small ? 18 : 30 }}>{s}</Text>;
}

function Corner({ pos, children }: { pos: 'tl' | 'br'; children: ReactNode }) {
  return (
    <View
      pointerEvents="none"
      style={[styles.corner, pos === 'tl' ? { top: 12, left: 14 } : { bottom: 12, right: 14, transform: [{ rotate: '180deg' }] }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  corner: { position: 'absolute' },
  rule: { position: 'absolute', left: 0, right: 0, height: 1 },
  margin: { position: 'absolute', top: 0, bottom: 0, left: 36, width: 1.5 },
});
