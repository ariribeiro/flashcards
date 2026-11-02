import { Pressable, StyleSheet, Text, View } from 'react-native';

import { deckStyle } from '@/theme/deckStyle';
import { useTheme } from '@/theme/useTheme';

import { DeckIcon } from './DeckIcon';

type Props = {
  deck: { id: string; name: string; color?: number; icon?: string; cardCount?: number };
  due?: number | null;
  onPress?: () => void;
  width?: number;
};

/** O baralho desenhado como uma pilha de cartas na cor escolhida. */
export function DeckStack({ deck, due, onPress, width = 160 }: Props) {
  const { colors, theme } = useTheme();
  const { color, icon } = deckStyle(deck, colors.decks.length);
  const c = colors.decks[color];
  const height = width * 1.32;
  const count = deck.cardCount ?? 0;

  const layer = (rotate: string, dx: number, opacity: number) => (
    <View
      style={[
        styles.layer,
        { width, height, backgroundColor: c, opacity, borderColor: colors.card, transform: [{ translateX: dx }, { rotate }] },
      ]}
    />
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${deck.name}, ${count} cartas${due ? `, ${due} para hoje` : ''}`}
      style={({ pressed }) => [{ width, height: height + 10, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      {count > 1 ? layer('-6deg', -4, 0.45) : null}
      {count > 0 ? layer('4deg', 4, 0.7) : null}
      <View style={[styles.front, { width, height, backgroundColor: c, borderColor: colors.card, shadowColor: colors.shadow }]}>
        {/* padrão do verso da carta */}
        <View style={[styles.inner, { borderColor: 'rgba(255,255,255,0.35)' }]} pointerEvents="none" />
        {theme.cardStyle === 'suits' ? <Text style={styles.suit}>♠</Text> : null}
        {theme.cardStyle === 'ruled'
          ? [0, 1, 2, 3].map((i) => <View key={i} style={[styles.rule, { bottom: 18 + i * 14 }]} />)
          : null}

        <View style={styles.iconWrap}>
          <DeckIcon name={icon} size={width * 0.17} color="#FFFFFF" />
        </View>
        <Text style={[styles.name, { fontFamily: theme.fonts.display, fontSize: width * 0.115 }]} numberOfLines={3}>
          {deck.name}
        </Text>
        <Text style={styles.count}>
          {count} {count === 1 ? 'carta' : 'cartas'}
        </Text>
      </View>

      {due ? (
        <View style={[styles.badge, { backgroundColor: colors.highlight }]}>
          <Text style={styles.badgeText}>{due} hoje</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 6, left: 0, borderRadius: 16, borderWidth: 2 },
  front: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 16,
    borderWidth: 3,
    padding: 14,
    justifyContent: 'flex-end',
    gap: 4,
    overflow: 'hidden',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  inner: { position: 'absolute', top: 7, left: 7, right: 7, bottom: 7, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed' },
  suit: { position: 'absolute', top: 10, right: 14, fontSize: 22, color: 'rgba(255,255,255,0.75)' },
  rule: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  iconWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  name: { color: '#FFFFFF', lineHeight: undefined },
  count: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#1F2937' },
});
