import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { maxContentWidth, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Container com conteúdo centralizado; `hero` ocupa a largura toda no topo. */
export function Screen({
  children,
  scroll = true,
  footer,
  hero,
  safeTop = false,
  fab,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  hero?: ReactNode;
  safeTop?: boolean;
  fab?: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inner = <View style={styles.inner}>{children}</View>;
  const top = hero ? 0 : safeTop ? insets.top : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: top }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xxxl + (footer ? 0 : insets.bottom) + (fab ? 72 : 0) }} keyboardShouldPersistTaps="handled">
          {hero}
          <View style={styles.pad}>{inner}</View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {hero}
          <View style={[styles.pad, { flex: 1 }]}>{inner}</View>
        </View>
      )}
      {fab ? <View style={[styles.fab, { bottom: space.xl + (footer ? 80 : 0) }]}>{fab}</View> : null}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: space.lg + insets.bottom, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.inner}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { paddingHorizontal: space.xl, paddingTop: space.xl },
  inner: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: space.xl, flex: 1 },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
  fab: { position: 'absolute', right: space.xl },
});
