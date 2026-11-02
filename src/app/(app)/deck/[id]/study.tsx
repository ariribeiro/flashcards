import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { saveReview } from '@/data/cards';
import { newRemainingToday } from '@/data/decks';
import { loadSettings, useDeck } from '@/data/hooks';
import { cardsCol } from '@/data/paths';
import { buildQueue, dueHorizon, isDue } from '@/data/queue';
import type { FlashCard } from '@/data/types';
import { fsrsFromFirestore, fsrsToFirestore } from '@/fsrs/convert';
import { formatInterval, GRADES, makeScheduler, type Grade } from '@/fsrs/scheduler';
import { maxContentWidth, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, IconButton, Text } from '@/ui';

/** Cartões em aprendizado que vencem em até 20 min são mostrados na mesma sessão. */
const LEARN_AHEAD_MS = 20 * 60 * 1000;

export default function Study() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = useDeck(id);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<FlashCard[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [scheduler, setScheduler] = useState(() => makeScheduler());
  const loaded = useRef(false);

  // Monta a fila uma vez, quando o baralho carrega.
  useEffect(() => {
    if (!deck || loaded.current) return;
    loaded.current = true;
    loadSettings().then((s) => setScheduler(makeScheduler(s.request_retention))).catch(() => {});
    getDocs(query(cardsCol(id), where('due', '<=', Timestamp.fromDate(dueHorizon())), orderBy('due', 'asc'))).then((snap) => {
      const t = Date.now();
      const due = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FlashCard, 'id'>) })).filter((c) => isDue(c, t));
      setQueue(buildQueue(due, newRemainingToday(deck)).queue);
    });
  }, [deck, id]);

  const current = queue?.[0];
  const now = new Date();
  const preview = useMemo(
    () => (current && revealed ? scheduler.repeat(fsrsFromFirestore(current), new Date()) : null),
    [current, revealed, scheduler],
  );

  const reveal = useCallback(() => {
    if (!current || revealed) return;
    setRevealed(true);
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
  }, [current, revealed]);

  const grade = useCallback(
    (g: Grade) => {
      if (!current || !deck || !revealed) return;
      const reviewedAt = new Date();
      const { card, log } = scheduler.next(fsrsFromFirestore(current), reviewedAt, g);
      saveReview(deck, current.id, current.state, card, log).catch((e) => console.warn('saveReview', e));
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      const updated: FlashCard = { ...current, ...fsrsToFirestore(card) };
      setQueue((q) => {
        const rest = (q ?? []).slice(1);
        // Reinsere se vence logo (passos de aprendizado), ordenado por vencimento.
        if (card.due.getTime() - reviewedAt.getTime() <= LEARN_AHEAD_MS) {
          const at = rest.findIndex((c) => c.due.toMillis() > updated.due.toMillis());
          const pos = Math.max(1, at === -1 ? rest.length : at); // nunca repete imediatamente se há outros
          return [...rest.slice(0, pos), updated, ...rest.slice(pos)];
        }
        return rest;
      });
      setDone((n) => n + 1);
      setRevealed(false);
    },
    [current, deck, revealed, scheduler],
  );

  // Atalhos de teclado na web: espaço/enter revela; 1–4 respondem.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) reveal();
        else grade(GRADES[2].grade);
      } else if (e.key === 'Escape') router.back();
      else {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) grade(g.grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reveal, grade, revealed]);

  const total = done + (queue?.length ?? 0);
  const progress = total ? done / total : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.top}>
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.bar, { backgroundColor: colors.accent, width: `${progress * 100}%` }]} />
        </View>
        <Text variant="small" style={{ minWidth: 72, textAlign: 'right' }}>
          {queue ? `${queue.length} restantes` : ''}
        </Text>
        <IconButton icon={X} label="Sair" onPress={() => router.back()} />
      </View>

      {queue === null ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : !current ? (
        <View style={styles.center}>
          <Text variant="title">Sessão concluída</Text>
          <Text variant="muted">{done} {done === 1 ? 'revisão' : 'revisões'} hoje. Volte amanhã.</Text>
          <Button label="Voltar" variant="secondary" onPress={() => router.back()} style={{ marginTop: space.xl }} />
        </View>
      ) : (
        <>
          <Pressable style={styles.cardArea} onPress={reveal} accessibilityHint="Toque para mostrar a resposta">
            <Animated.View key={`${current.id}-${done}`} entering={FadeIn.duration(180)} style={styles.card}>
              <Text variant="card">{current.front}</Text>
              {revealed ? (
                <Animated.View entering={FadeIn.duration(160)} style={{ width: '100%', gap: space.xl }}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text variant="card" style={{ color: colors.text, fontSize: 22, lineHeight: 32 }}>{current.back}</Text>
                </Animated.View>
              ) : null}
            </Animated.View>
          </Pressable>

          <View style={styles.bottom}>
            {revealed && preview ? (
              <View style={styles.grades}>
                {GRADES.map(({ grade: g, label }) => {
                  const tone = [colors.again, colors.hard, colors.good, colors.easy][g - 1];
                  return (
                    <Pressable
                      key={g}
                      onPress={() => grade(g)}
                      style={({ pressed }) => [styles.gradeBtn, { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}>
                      <Text style={{ color: tone, fontWeight: '600' }}>{label}</Text>
                      <Text variant="small">{formatInterval(now, preview[g].card.due)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Button label="Mostrar resposta" variant="secondary" onPress={reveal} />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 48, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  track: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  bar: { height: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  cardArea: { flex: 1, justifyContent: 'center' },
  card: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', alignItems: 'center', gap: space.xl, paddingVertical: space.xxl },
  divider: { height: 1, width: 48, alignSelf: 'center' },
  bottom: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', minHeight: 64, justifyContent: 'flex-end' },
  grades: { flexDirection: 'row', gap: space.sm },
  gradeBtn: { flex: 1, alignItems: 'center', paddingVertical: space.md, borderRadius: radius, borderWidth: 1, gap: 2 },
});
