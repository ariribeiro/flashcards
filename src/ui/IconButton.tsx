import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export function IconButton({
  icon: Icon,
  onPress,
  label,
  size = 22,
  color,
  filled,
}: {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 8,
        borderRadius: 999,
        backgroundColor: filled ? colors.subtle : 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}>
      <Icon size={size} color={color ?? colors.text} strokeWidth={2} />
    </Pressable>
  );
}
