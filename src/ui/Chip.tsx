import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { space } from '@/theme/tokens';

export function Chip({ icon: Icon, label, value, color, textColor }: { icon?: LucideIcon; label: string; value?: number | string; color: string; textColor?: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      {Icon ? <Icon size={16} color={textColor ?? color} strokeWidth={2.2} /> : null}
      {value !== undefined ? <Text style={[styles.value, { color: textColor ?? color }]}>{value}</Text> : null}
      <Text style={[styles.label, { color: textColor ?? color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  value: { fontSize: 15, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600' },
});
