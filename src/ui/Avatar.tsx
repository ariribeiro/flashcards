import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export function initials(name?: string | null, email?: string | null): string {
  const base = (name || email || '?').trim();
  const parts = base.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 && name ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Avatar({ name, email, photoURL, size = 40 }: { name?: string | null; email?: string | null; photoURL?: string | null; size?: number }) {
  const { colors } = useTheme();
  const style = { width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: colors.highlight };
  if (photoURL) return <Image source={{ uri: photoURL }} style={style} contentFit="cover" accessibilityLabel={name ?? 'Avatar'} />;
  return (
    <View style={[style, { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: colors.accentText, fontWeight: '800', fontSize: size * 0.38 }}>{initials(name, email)}</Text>
    </View>
  );
}
