import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { fontSize, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  size?: 'md' | 'lg';
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', icon: Icon, disabled, loading, size = 'md', style }: Props) {
  const { colors } = useTheme();
  const map = {
    primary: { bg: colors.accent, fg: colors.accentText, border: colors.accent },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.muted, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
    light: { bg: 'rgba(255,255,255,0.18)', fg: '#FFFFFF', border: 'rgba(255,255,255,0.35)' },
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.lg,
        {
          backgroundColor: map.bg,
          borderColor: map.border,
          opacity: inactive ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && { shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={map.fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon size={size === 'lg' ? 20 : 18} color={map.fg} strokeWidth={2.2} /> : null}
          <Text style={[styles.label, size === 'lg' && { fontSize: 17 }, { color: map.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: space.xl, borderRadius: radius, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  lg: { minHeight: 56 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { fontSize: fontSize.body, fontWeight: '700' },
});
