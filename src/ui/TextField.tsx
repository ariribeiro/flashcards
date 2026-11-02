import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fontSize, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Text } from './Text';

export function TextField({ label, hint, style, multiline, ...props }: TextInputProps & { label?: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? <Text variant="small" style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        multiline={multiline}
        {...props}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            minHeight: multiline ? 120 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
      />
      {hint ? <Text variant="small">{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    borderWidth: 1,
    borderRadius: radius,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontSize: fontSize.body,
  },
});
