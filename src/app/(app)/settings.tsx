import { useEffect, useState } from 'react';
import { Linking, Platform, View } from 'react-native';

import { getGeminiKey, getGeminiModel, removeGeminiKey, setGeminiKey, setGeminiModel } from '@/ai/apiKey';
import { DEFAULT_GEMINI_MODEL, GeminiError, testGeminiKey } from '@/ai/gemini';
import { useAuth } from '@/auth/AuthProvider';
import { loadSettings, saveSettings } from '@/data/hooks';
import { confirm, notify } from '@/lib/confirm';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, Screen, Segmented, Text, TextField } from '@/ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <Text variant="small" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [model, setModel] = useState(DEFAULT_GEMINI_MODEL);
  const [testing, setTesting] = useState(false);
  const [retention, setRetention] = useState(0.9);

  useEffect(() => {
    getGeminiKey().then((k) => {
      setHasKey(!!k);
      setKey(k ?? '');
    });
    getGeminiModel().then((m) => m && setModel(m));
    loadSettings().then((s) => setRetention(s.request_retention)).catch(() => {});
  }, []);

  async function saveKey() {
    setTesting(true);
    try {
      await testGeminiKey(key.trim(), model.trim() || DEFAULT_GEMINI_MODEL);
      await setGeminiKey(key.trim());
      await setGeminiModel(model.trim() || DEFAULT_GEMINI_MODEL);
      setHasKey(true);
      notify('Chave salva', 'Conexão com o Gemini funcionando.');
    } catch (e) {
      notify('Não foi possível validar', e instanceof GeminiError ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  }

  async function removeKey() {
    if (!(await confirm('Remover chave', 'A chave do Gemini será apagada deste dispositivo.', 'Remover'))) return;
    await removeGeminiKey();
    setKey('');
    setHasKey(false);
  }

  return (
    <Screen>
      <Section title="Gemini (opcional)">
        <Text variant="muted">
          Com a sua chave, os cartões são gerados com um toque. A chave fica só{' '}
          {Platform.OS === 'web' ? 'neste navegador' : 'neste dispositivo (Keychain)'} e nunca é enviada ao nosso servidor.
        </Text>
        <Text
          style={{ color: colors.accent }}
          onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}>
          Obter uma chave no Google AI Studio →
        </Text>
        <TextField
          label="Chave de API"
          value={key}
          onChangeText={setKey}
          placeholder="AIza..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField label="Modelo" value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button label={hasKey ? 'Testar e salvar' : 'Salvar chave'} onPress={saveKey} loading={testing} disabled={!key.trim()} style={{ flex: 1 }} />
          {hasKey ? <Button label="Remover" variant="ghost" onPress={removeKey} /> : null}
        </View>
      </Section>

      <Section title="Retenção desejada">
        <Text variant="muted">Quanto maior, mais revisões e menos esquecimento.</Text>
        <Segmented
          options={[
            { label: '85%', value: 0.85 },
            { label: '90%', value: 0.9 },
            { label: '95%', value: 0.95 },
          ]}
          value={retention}
          onChange={(v) => {
            setRetention(v);
            saveSettings({ request_retention: v }).catch(() => {});
          }}
        />
      </Section>

      <Section title="Conta">
        <Text variant="muted">{user?.email ?? user?.displayName ?? 'Conectado'}</Text>
        <Button label="Sair" variant="secondary" onPress={signOut} />
      </Section>
    </Screen>
  );
}
