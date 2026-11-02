import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { appleSignInAvailable, signInWithApple } from '@/auth/apple';
import { signInWithGoogle } from '@/auth/google';
import { notify } from '@/lib/confirm';
import { space } from '@/theme/tokens';
import { Button, Screen, Text } from '@/ui';

export default function Login() {
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
    <Screen scroll={false} safeTop>
      <View style={styles.center}>
        <View style={styles.hero}>
          <Text variant="title" style={styles.title}>Flashcards</Text>
          <Text variant="muted" style={styles.text}>Aprenda com repetição espaçada.</Text>
        </View>
        <View style={styles.actions}>
          <Button label="Entrar com Google" onPress={() => run('google')} loading={busy === 'google'} disabled={!!busy} />
          {apple ? (
            <Button label="Entrar com Apple" variant="secondary" onPress={() => run('apple')} loading={busy === 'apple'} disabled={!!busy} />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: space.xxxl, maxWidth: 360, width: '100%', alignSelf: 'center' },
  hero: { gap: space.sm, alignItems: 'center' },
  title: { fontSize: 32 },
  text: { textAlign: 'center' },
  actions: { gap: space.md },
});
