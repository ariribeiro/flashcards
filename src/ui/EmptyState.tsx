import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { space } from '@/theme/tokens';

import { Button } from './Button';
import { LogoMark } from './Logo';
import { Text } from './Text';

export function EmptyState({
  title,
  message,
  action,
  onAction,
  actionIcon,
}: {
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}) {
  return (
    <View style={styles.wrap}>
      <LogoMark size={96} />
      <Text variant="title" style={styles.center}>{title}</Text>
      {message ? <Text variant="muted" style={[styles.center, { maxWidth: 360 }]}>{message}</Text> : null}
      {action && onAction ? <Button label={action} icon={actionIcon} onPress={onAction} style={{ marginTop: space.md }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  center: { textAlign: 'center' },
});
