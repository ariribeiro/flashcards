import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export function IconButton({
  icon: Icon,
  onPress,
  label,
  size = 22,
}: {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}>
      <Icon size={size} color={colors.muted} strokeWidth={1.75} />
    </Pressable>
  );
}
