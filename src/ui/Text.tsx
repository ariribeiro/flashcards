import { Text as RNText, type TextProps } from 'react-native';

import { fontSize } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Variant = 'hero' | 'title' | 'subtitle' | 'body' | 'muted' | 'small' | 'label' | 'card';

export function Text({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  const { colors, theme } = useTheme();
  const display = theme.fonts.display;
  const base = {
    hero: { fontSize: fontSize.hero, fontFamily: display, color: colors.text, letterSpacing: -0.5, lineHeight: 40 },
    title: { fontSize: fontSize.title, fontFamily: display, color: colors.text, letterSpacing: -0.3, lineHeight: 30 },
    subtitle: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
    body: { fontSize: fontSize.body, color: colors.text, lineHeight: 22 },
    muted: { fontSize: fontSize.body, color: colors.muted, lineHeight: 22 },
    small: { fontSize: fontSize.small, color: colors.muted },
    label: { fontSize: 12, fontWeight: '700' as const, color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
    card: { fontSize: fontSize.card, color: colors.cardText, lineHeight: 34, textAlign: 'center' as const, fontFamily: display },
  }[variant];
  return <RNText {...props} style={[base, style]} />;
}
