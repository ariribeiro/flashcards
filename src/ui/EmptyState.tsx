import { StyleSheet, View } from 'react-native';

import { space } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

export function EmptyState({ title, message, action, onAction }: { title: string; message?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text variant="title" style={styles.center}>{title}</Text>
      {message ? <Text variant="muted" style={styles.center}>{message}</Text> : null}
      {action && onAction ? <Button label={action} onPress={onAction} style={{ marginTop: space.md }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxxl },
  center: { textAlign: 'center' },
});
