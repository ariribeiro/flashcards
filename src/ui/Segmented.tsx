import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.subtle, borderColor: colors.border }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            style={[styles.item, active && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: fontSize.small, fontWeight: active ? '600' : '400', color: active ? colors.text : colors.muted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: radius, borderWidth: 1, padding: 3, gap: 3 },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.sm,
    borderRadius: radius - 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
