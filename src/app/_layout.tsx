import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { AppThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { user, initializing } = useAuth();
  const { colors, scheme, ready } = useTheme();
  const [fontsLoaded, fontError] = useFonts({ Fraunces_700Bold, PlayfairDisplay_700Bold, PlusJakartaSans_800ExtraBold });
  const loading = initializing || !ready || (!fontsLoaded && !fontError);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: colors.background, card: colors.tabBar, text: colors.text, border: colors.border, primary: colors.accent },
  };
  // Mesa de jogo é escura mesmo na variante clara
  const lightContent = scheme === 'dark' || colors.background === '#0F5132';

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={lightContent ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </AppThemeProvider>
  );
}
