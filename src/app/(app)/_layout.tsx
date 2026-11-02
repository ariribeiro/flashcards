import { Stack } from 'expo-router';

import { useTheme } from '@/theme/useTheme';

export default function AppLayout() {
  const { colors, theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: theme.fonts.display },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="deck/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="deck/[id]/study" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="deck/[id]/generate" options={{ title: 'Gerar cartas com IA' }} />
      <Stack.Screen name="deck/[id]/card" options={{ title: 'Carta', presentation: 'modal' }} />
    </Stack>
  );
}
