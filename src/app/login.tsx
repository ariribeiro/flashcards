import { LinearGradient } from 'expo-linear-gradient';
import { Apple } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appleSignInAvailable, signInWithApple } from '@/auth/apple';
import { signInWithGoogle } from '@/auth/google';
import { notify } from '@/lib/confirm';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { GoogleIcon, LogoMark, PlayingCard, Text } from '@/ui';

const SAMPLE = [
  { q: 'Onde ocorre o ciclo de Krebs?', rot: '-14deg', x: -92, y: 10 },
  { q: 'Qual é a capital da Austrália?', rot: '12deg', x: 92, y: 30 },
];

export default function Login() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [apple, setApple] = useState(false);

  useEffect(() => {
    appleSignInAvailable().then(setApple).catch(() => setApple(false));
  }, []);

  async function run(kind: 'google' | 'apple') {
    setBusy(kind);
    try {
      await (kind === 'google' ? signInWithGoogle() : signInWithApple());
    } catch (e) {
      notify('Não foi possível entrar', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <LinearGradient colors={[colors.heroFrom, colors.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={[styles.root, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.brand}>
          <LogoMark size={88} />
          <Text variant="hero" style={{ color: colors.heroText, fontSize: 40, lineHeight: 48 }}>Flashcards</Text>
          <Text style={{ color: colors.heroText, opacity: 0.85, fontSize: 17, textAlign: 'center', maxWidth: 320 }}>
            Seu baralho de estudos, sempre na medida certa.
          </Text>
        </View>

        {/* Cartas decorativas em leque */}
        <View style={styles.fan} pointerEvents="none">
          {SAMPLE.map((s) => (
            <PlayingCard key={s.q} compact style={[styles.sample, { transform: [{ translateX: s.x }, { translateY: s.y }, { rotate: s.rot }] }]}>
              <Text style={{ color: colors.cardText, fontFamily: theme.fonts.display, fontSize: 15, textAlign: 'center' }}>{s.q}</Text>
            </PlayingCard>
          ))}
          <PlayingCard compact style={[styles.sample, { zIndex: 2 }]}>
            <Text style={{ color: colors.cardText, fontFamily: theme.fonts.display, fontSize: 16, textAlign: 'center' }}>
              Aprenda mais revisando menos
            </Text>
          </PlayingCard>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => run('google')}
            disabled={!!busy}
            style={({ pressed }) => [styles.google, { opacity: busy ? 0.6 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            {busy === 'google' ? <ActivityIndicator color="#1F1F1F" /> : <GoogleIcon size={22} />}
            <RNText style={styles.googleText}>Entrar com Google</RNText>
          </Pressable>
          {apple ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => run('apple')}
              disabled={!!busy}
              style={({ pressed }) => [styles.google, { backgroundColor: '#000', transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
              {busy === 'apple' ? <ActivityIndicator color="#fff" /> : <Apple size={22} color="#fff" fill="#fff" />}
              <RNText style={[styles.googleText, { color: '#fff' }]}>Entrar com Apple</RNText>
            </Pressable>
          ) : null}
          <Text style={{ color: colors.heroText, opacity: 0.7, fontSize: 12, textAlign: 'center' }}>
            Repetição espaçada com o algoritmo FSRS
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl, justifyContent: 'space-between', alignItems: 'center' },
  brand: { alignItems: 'center', gap: space.sm, marginTop: space.xl },
  fan: { height: 220, width: '100%', alignItems: 'center', justifyContent: 'center' },
  sample: { position: 'absolute', width: 150, height: 200, justifyContent: 'center' },
  actions: { width: '100%', maxWidth: 380, gap: space.md },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  googleText: { fontSize: 17, fontWeight: '700', color: '#1F1F1F' },
});
