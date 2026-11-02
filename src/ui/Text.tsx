import { Text as RNText, type TextProps } from 'react-native';

import { fontSize } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Variant = 'title' | 'body' | 'muted' | 'small' | 'card';

export function Text({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  const { colors } = useTheme();
  const base = {
    title: { fontSize: fontSize.title, fontWeight: '600' as const, color: colors.text, letterSpacing: -0.3 },
    body: { fontSize: fontSize.body, color: colors.text, lineHeight: 22 },
    muted: { fontSize: fontSize.body, color: colors.muted, lineHeight: 22 },
    small: { fontSize: fontSize.small, color: colors.muted },
    card: { fontSize: fontSize.card, color: colors.text, lineHeight: 36, textAlign: 'center' as const },
  }[variant];
  return <RNText {...props} style={[base, style]} />;
}
