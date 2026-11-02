import { View } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

import { Text } from './Text';

/** Três cartas em leque nas cores do tema. */
export function LogoMark({ size = 56 }: { size?: number }) {
  const { colors } = useTheme();
  const [a, b, c] = [colors.decks[0], colors.decks[1], colors.decks[2]];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <G transform="rotate(-18 32 52)">
        <Rect x="18" y="10" width="28" height="40" rx="5" fill={a} stroke="#fff" strokeWidth="2" />
      </G>
      <G transform="rotate(14 32 52)">
        <Rect x="18" y="10" width="28" height="40" rx="5" fill={b} stroke="#fff" strokeWidth="2" />
      </G>
      <Rect x="18" y="12" width="28" height="40" rx="5" fill={c} stroke="#fff" strokeWidth="2" />
      <Path d="M32 24 l4 8 -4 8 -4 -8z" fill="#fff" />
      <SvgText x="22" y="21" fontSize="7" fontWeight="bold" fill="#fff">A</SvgText>
    </Svg>
  );
}

export function Logo({ size = 56, color }: { size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <Text variant="title" style={{ fontSize: size * 0.5, lineHeight: size * 0.6, color }}>Flashcards</Text>
    </View>
  );
}
