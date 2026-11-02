import { Tabs } from 'expo-router';
import { House, Layers, UserRound } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        tabBarVariant: wide ? 'material' : 'uikit',
        tabBarLabelPosition: wide ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: colors.link,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: wide ? colors.subtle : undefined,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderRightColor: colors.border,
          ...(wide ? { width: 220, paddingTop: 24 } : {}),
        },
        tabBarItemStyle: wide ? { borderRadius: 12, marginHorizontal: 8, marginVertical: 2, justifyContent: 'flex-start' } : undefined,
        tabBarLabelStyle: { fontWeight: '700', fontSize: wide ? 15 : 11 },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="decks" options={{ title: 'Baralhos', tabBarIcon: ({ color, size }) => <Layers color={color} size={size} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} strokeWidth={2.2} /> }} />
    </Tabs>
  );
}
