import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { maxContentWidth, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Container com conteúdo centralizado e largura máxima (legível na web). */
export function Screen({
  children,
  scroll = true,
  footer,
  safeTop = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  safeTop?: boolean;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inner = <View style={styles.inner}>{children}</View>;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: safeTop ? insets.top : 0 }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: space.xxxl + insets.bottom }]}
          keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{inner}</View>
      )}
      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: space.lg + insets.bottom, backgroundColor: colors.background, borderTopColor: colors.border },
          ]}>
          <View style={styles.inner}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.xl },
  inner: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: space.xl, flex: 1 },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
