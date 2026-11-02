import { Check, KeyRound, LogOut, Moon, Palette, Sun, SunMoon, Target } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { getGeminiKey, getGeminiModel, removeGeminiKey, setGeminiKey, setGeminiModel } from '@/ai/apiKey';
import { DEFAULT_GEMINI_MODEL, GeminiError, testGeminiKey } from '@/ai/gemini';
import { useAuth } from '@/auth/AuthProvider';
import { loadSettings, saveSettings } from '@/data/hooks';
import { confirm, notify } from '@/lib/confirm';
import { THEME_LIST, type Appearance, type ThemeDef } from '@/theme/themes';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Avatar, Button, Hero, Segmented, Surface, Text, TextField } from '@/ui';

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Surface style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.subtle }]}>
          <Icon size={18} color={colors.text} />
        </View>
        <Text variant="subtitle" style={{ fontSize: 17 }}>{title}</Text>
      </View>
      {children}
    </Surface>
  );
}

/** Mini pré-visualização do tema: fundo + uma carta + duas cores de baralho. */
function ThemeOption({ t, active, onPress }: { t: ThemeDef; active: boolean; onPress: () => void }) {
  const { colors, scheme } = useTheme();
  const p = t[scheme];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={`Tema ${t.name}`}
      style={[styles.themeOpt, { borderColor: active ? colors.link : colors.border }]}>
      <View style={[styles.themePreview, { backgroundColor: p.background }]}>
        <View style={[styles.miniCard, { backgroundColor: p.decks[1], transform: [{ rotate: '-10deg' }], left: 18 }]} />
        <View style={[styles.miniCard, { backgroundColor: p.decks[0], transform: [{ rotate: '6deg' }], left: 34 }]} />
        <View style={[styles.miniCard, { backgroundColor: p.card, borderColor: p.cardBorder, borderWidth: 1, left: 50, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: t.cardStyle === 'suits' ? '#B3261E' : p.cardText, fontSize: 14, fontFamily: t.fonts.display }}>
            {t.cardStyle === 'suits' ? '♥' : 'Aa'}
          </Text>
        </View>
        {active ? (
          <View style={[styles.check, { backgroundColor: colors.accent }]}>
            <Check size={12} color={colors.accentText} strokeWidth={3} />
          </View>
        ) : null}
      </View>
      <View style={{ padding: 10, gap: 2 }}>
        <Text style={{ fontWeight: '800', fontSize: 14 }}>{t.name}</Text>
        <Text variant="small" numberOfLines={2}>{t.description}</Text>
      </View>
    </Pressable>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { colors, theme, setThemeId, appearance, setAppearance } = useTheme();
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

  async function logout() {
    if (await confirm('Sair da conta', 'Você precisará entrar de novo para ver seus baralhos.', 'Sair')) await signOut();
  }

  const name = user?.displayName || user?.email?.split('@')[0] || 'Estudante';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollArea>
        <Hero>
          <View style={styles.identity}>
            <Avatar name={user?.displayName} email={user?.email} photoURL={user?.photoURL} size={72} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title" style={{ color: colors.heroText }} numberOfLines={1}>{name}</Text>
              {user?.email ? <Text style={{ color: colors.heroText, opacity: 0.8 }} numberOfLines={1}>{user.email}</Text> : null}
            </View>
          </View>
          <Button label="Sair da conta" icon={LogOut} variant={colors.heroText.startsWith('#F') ? 'light' : 'danger'} onPress={logout} />
        </Hero>

        <View style={styles.body}>
          <Section icon={Palette} title="Tema">
            <View style={styles.themes}>
              {THEME_LIST.map((t) => (
                <ThemeOption key={t.id} t={t} active={t.id === theme.id} onPress={() => setThemeId(t.id)} />
              ))}
            </View>
            <Segmented<Appearance>
              options={[
                { label: 'Sistema', value: 'system' },
                { label: 'Claro', value: 'light' },
                { label: 'Escuro', value: 'dark' },
              ]}
              value={appearance}
              onChange={setAppearance}
            />
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {appearance === 'dark' ? <Moon size={14} color={colors.muted} /> : appearance === 'light' ? <Sun size={14} color={colors.muted} /> : <SunMoon size={14} color={colors.muted} />}
              <Text variant="small">O tema fica salvo neste dispositivo.</Text>
            </View>
          </Section>

          <Section icon={Target} title="Retenção desejada">
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

          <Section icon={KeyRound} title="Gemini (opcional)">
            <Text variant="muted">
              Com a sua chave, as cartas são geradas com um toque. Ela fica só {Platform.OS === 'web' ? 'neste navegador' : 'neste dispositivo (Keychain)'}.
            </Text>
            <Text style={{ color: colors.link, fontWeight: '700' }} onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}>
              Obter uma chave no Google AI Studio →
            </Text>
            <TextField label="Chave de API" value={key} onChangeText={setKey} placeholder="AIza..." secureTextEntry autoCapitalize="none" autoCorrect={false} />
            <TextField label="Modelo" value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} />
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button label={hasKey ? 'Testar e salvar' : 'Salvar chave'} onPress={saveKey} loading={testing} disabled={!key.trim()} style={{ flex: 1 }} />
              {hasKey ? <Button label="Remover" variant="ghost" onPress={removeKey} /> : null}
            </View>
          </Section>
        </View>
      </ScrollArea>
    </View>
  );
}

function ScrollArea({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={{ paddingBottom: space.xxxl }}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  body: { padding: space.xl, gap: space.lg, width: '100%', maxWidth: 720, alignSelf: 'center' },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  themes: { flexDirection: 'row', gap: space.sm },
  themeOpt: { flex: 1, borderWidth: 2, borderRadius: 14, overflow: 'hidden' },
  themePreview: { height: 78 },
  miniCard: { position: 'absolute', top: 14, width: 34, height: 48, borderRadius: 6 },
  check: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
