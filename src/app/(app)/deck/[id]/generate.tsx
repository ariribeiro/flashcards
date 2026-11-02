import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Check, Clipboard as ClipboardIcon, FileUp, Target, Wand2, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getGeminiKey, getGeminiModel } from '@/ai/apiKey';
import { GeminiError, generateCardsWithGemini } from '@/ai/gemini';
import { parseCards } from '@/ai/parse';
import { buildPrompt } from '@/ai/prompt';
import type { GeneratedCard } from '@/ai/schema';
import { addCards } from '@/data/cards';
import { useDeck } from '@/data/hooks';
import { notify } from '@/lib/confirm';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, PlayingCard, Screen, Segmented, Surface, Text, TextField } from '@/ui';

type Step = 'subject' | 'intent' | 'result' | 'preview';
type Item = GeneratedCard & { include: boolean };

const STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: BookOpen, label: 'Assunto' },
  { icon: Target, label: 'Objetivo' },
  { icon: Wand2, label: 'Gerar' },
];

function StepLabel({ n, title }: { n: number; title: string }) {
  const { colors } = useTheme();
  const accent = colors.link;
  return (
    <View style={{ gap: space.lg }}>
      <View style={styles.steps}>
        {STEPS.map((s, i) => {
          const state = i + 1 < n ? 'done' : i + 1 === n ? 'active' : 'todo';
          const Icon = state === 'done' ? Check : s.icon;
          return (
            <View key={s.label} style={styles.stepItem}>
              {i > 0 ? <View style={[styles.stepLine, { backgroundColor: i < n ? accent : colors.border }]} /> : null}
              <View
                style={[
                  styles.stepDot,
                  state === 'todo'
                    ? { backgroundColor: colors.surface, borderColor: colors.border }
                    : { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}>
                <Icon size={18} color={state === 'todo' ? colors.muted : colors.accentText} strokeWidth={2.4} />
              </View>
              <Text variant="small" style={{ fontWeight: state === 'active' ? '800' : '500', color: state === 'todo' ? colors.muted : colors.text }}>{s.label}</Text>
            </View>
          );
        })}
      </View>
      <Text variant="title">{title}</Text>
    </View>
  );
}

function PreviewItem({ item, onChange }: { item: Item; onChange: (i: Item) => void }) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  return (
    <PlayingCard compact style={{ gap: space.sm, opacity: item.include ? 1 : 0.45, paddingLeft: 40, paddingRight: 36, borderRadius: 14 }}>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.include }}
          hitSlop={10}
          onPress={() => onChange({ ...item, include: !item.include })}
          style={[styles.check, { borderColor: item.include ? colors.accent : colors.border, backgroundColor: item.include ? colors.accent : 'transparent' }]}>
          {item.include ? <Check size={14} color={colors.accentText} strokeWidth={3} /> : null}
        </Pressable>
        <Pressable style={{ flex: 1, gap: space.xs }} onPress={() => setEditing((e) => !e)}>
          {editing ? (
            <>
              <TextField value={item.front} onChangeText={(front) => onChange({ ...item, front })} multiline style={{ minHeight: 64 }} />
              <TextField value={item.back} onChangeText={(back) => onChange({ ...item, back })} multiline style={{ minHeight: 64 }} />
            </>
          ) : (
            <>
              <Text style={{ fontWeight: '600', color: colors.cardText }}>{item.front}</Text>
              <Text style={{ color: colors.cardText, opacity: 0.65 }}>{item.back}</Text>
            </>
          )}
        </Pressable>
      </View>
    </PlayingCard>
  );
}

export default function Generate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = useDeck(id);
  const [step, setStep] = useState<Step>('subject');
  const [subject, setSubject] = useState('');
  const [intent, setIntent] = useState('');
  const [count, setCount] = useState(20);
  const [pasted, setPasted] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [geminiKey, setGeminiKeyState] = useState<string | null>(null);
  const [model, setModel] = useState<string | undefined>();
  const [busy, setBusy] = useState<'gemini' | 'import' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getGeminiKey().then(setGeminiKeyState);
    getGeminiModel().then((m) => setModel(m ?? undefined));
  }, []);

  const prompt = buildPrompt({ subject, intent, count });

  function toPreview(text: string) {
    const r = parseCards(text);
    if (!r.ok) {
      notify('Não foi possível ler as cartas', r.error);
      return;
    }
    setItems(r.cards.map((c) => ({ ...c, include: true })));
    setWarnings(r.errors);
    setStep('preview');
  }

  async function copy() {
    await Clipboard.setStringAsync(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function gemini() {
    if (!geminiKey) return;
    setBusy('gemini');
    try {
      const r = await generateCardsWithGemini({ subject, intent, count, apiKey: geminiKey, model });
      if (!r.ok) notify('Resposta inesperada do Gemini', r.error);
      else {
        setItems(r.cards.map((c) => ({ ...c, include: true })));
        setWarnings(r.errors);
        setStep('preview');
      }
    } catch (e) {
      notify('Erro no Gemini', e instanceof GeminiError ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function pickFile() {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    const text = await (await fetch(res.assets[0].uri)).text();
    toPreview(text);
  }

  async function importCards() {
    const chosen = items.filter((i) => i.include && i.front.trim() && i.back.trim());
    if (!chosen.length) return;
    setBusy('import');
    try {
      await addCards(id, chosen.map(({ front, back, tags }) => ({ front, back, tags })));
      router.back();
    } catch (e) {
      notify('Erro ao importar', e instanceof Error ? e.message : String(e));
      setBusy(null);
    }
  }

  const selected = items.filter((i) => i.include).length;

  if (step === 'subject') {
    return (
      <Screen footer={<Button label="Continuar" onPress={() => setStep('intent')} disabled={!subject.trim()} />}>
        <StepLabel n={1} title="Qual é o assunto?" />
        <TextField
          value={subject}
          onChangeText={setSubject}
          placeholder={deck?.name ? `Ex.: ${deck.name}` : 'Ex.: Ciclo de Krebs'}
          autoFocus
          multiline
          style={{ minHeight: 96 }}
        />
      </Screen>
    );
  }

  if (step === 'intent') {
    return (
      <Screen
        footer={
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="Voltar" variant="ghost" onPress={() => setStep('subject')} />
            <Button label="Continuar" onPress={() => setStep('result')} disabled={!intent.trim()} style={{ flex: 1 }} />
          </View>
        }>
        <StepLabel n={2} title="Qual é o seu objetivo?" />
        <TextField
          value={intent}
          onChangeText={setIntent}
          placeholder="Ex.: passar na prova de bioquímica do 2º semestre, focando nos conceitos que mais caem"
          autoFocus
          multiline
          style={{ minHeight: 96 }}
        />
        <View style={{ gap: space.sm }}>
          <Text variant="small" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>Quantidade de cartas</Text>
          <Segmented
            options={[10, 20, 30, 50].map((n) => ({ label: String(n), value: n }))}
            value={count}
            onChange={setCount}
          />
        </View>
      </Screen>
    );
  }

  if (step === 'result') {
    return (
      <Screen
        footer={
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="Voltar" variant="ghost" onPress={() => setStep('intent')} />
            <Button label="Ler cartas" onPress={() => toPreview(pasted)} disabled={!pasted.trim()} style={{ flex: 1 }} />
          </View>
        }>
        <StepLabel n={3} title="Gerar as cartas" />

        {geminiKey ? (
          <View style={{ gap: space.sm }}>
            <Button label="Gerar com Gemini" icon={Wand2} size="lg" onPress={gemini} loading={busy === 'gemini'} />
            <Text variant="small" style={{ textAlign: 'center' }}>ou use qualquer IA com o prompt abaixo</Text>
          </View>
        ) : (
          <Text variant="muted">
            Copie o prompt, cole no ChatGPT, Claude, Gemini ou outra IA e traga a resposta de volta. Para gerar direto, salve uma chave do Gemini em Configurações.
          </Text>
        )}

        <Surface style={{ gap: space.md }}>
          <Text variant="small" numberOfLines={6}>{prompt}</Text>
          <Button label={copied ? 'Copiado!' : 'Copiar prompt'} icon={copied ? Check : ClipboardIcon} variant="secondary" onPress={copy} />
        </Surface>

        <TextField
          label="Resposta da IA"
          value={pasted}
          onChangeText={setPasted}
          multiline
          placeholder='{"cards": [{"front": "...", "back": "..."}]}'
          autoCapitalize="none"
          autoCorrect={false}
          style={{ minHeight: 160, fontFamily: 'monospace', fontSize: 13 }}
        />
        <Button label="Enviar arquivo .json" icon={FileUp} variant="ghost" onPress={pickFile} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button label="Voltar" variant="ghost" onPress={() => setStep('result')} />
          <Button
            label={`Importar ${selected} ${selected === 1 ? 'carta' : 'cartas'}`}
            onPress={importCards}
            loading={busy === 'import'}
            disabled={!selected}
            style={{ flex: 1 }}
          />
        </View>
      }>
      <View style={{ gap: space.xs }}>
        <Text variant="title">Revise as cartas</Text>
        <Text variant="muted">Toque numa carta para editar. Desmarque as que não quiser.</Text>
      </View>
      {warnings.length ? (
        <Text variant="small">{warnings.length} item(ns) ignorado(s): {warnings.slice(0, 3).join('; ')}</Text>
      ) : null}
      <View style={{ gap: space.sm }}>
        {items.map((it, i) => (
          <PreviewItem key={i} item={it} onChange={(n) => setItems((arr) => arr.map((x, j) => (j === i ? n : x)))} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', justifyContent: 'space-between' },
  stepItem: { flex: 1, alignItems: 'center', gap: 6 },
  stepLine: { position: 'absolute', top: 19, right: '50%', width: '100%', height: 2 },
  stepDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check: { width: 22, height: 22, borderRadius: radius / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
