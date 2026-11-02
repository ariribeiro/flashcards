import { Stack } from 'expo-router';

import { useTheme } from '@/theme/useTheme';

export default function AppLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Baralhos' }} />
      <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
      <Stack.Screen name="deck/[id]/index" options={{ title: '' }} />
      <Stack.Screen name="deck/[id]/study" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="deck/[id]/generate" options={{ title: 'Gerar cartões' }} />
      <Stack.Screen name="deck/[id]/card" options={{ title: 'Cartão', presentation: 'modal' }} />
    </Stack>
  );
}
